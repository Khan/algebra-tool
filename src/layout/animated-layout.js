import { Layout } from './layout';

function easeQuadratic(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeCubic(t) {
    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function easeInCubic(t) {
    return t * t * t;
}

function easeOutCubic(t) {
    return (--t) * t * t + 1;
}

/**
 * Interpolates between two values.
 *
 * @param val1
 * @param val2
 * @param t
 * @returns {number}
 */
function lerp(val1, val2, t) {
    return (1 - t) * val1 + t * val2;
}

/**
 * Interpolates between two layouts.
 *
 * @param {Object} layout1
 * @param {Object} layout2
 * @param {Array} ids
 * @param {Number} t A number between 0 and 1
 */
function lerpLayout(layout1, layout2, ids, t) {
    let children1 = {};
    let children2 = {};

    layout1.children.forEach(child => children1[child.id] = child);
    layout2.children.forEach(child => children2[child.id] = child);

    // TODO: lerp all glyphs/sublayouts with the same id
    let layout = new Layout(ids.map(id => {
        const child1 = children1[id];
        const child2 = children2[id];

        const x = lerp(child1.x, child2.x, t);
        const y = lerp(child1.y, child2.y, t);

        const child = child1.clone();
        child.x = x;
        child.y = y;

        if (child1.type === 'box') {
            const width = lerp(child1.width, child2.width, t);
            const height = lerp(child1.height, child2.height, t);

            child.width = width;
            child.height = height;
        }

        return child;
    }));

    layout.x = lerp(layout1.x, layout2.x, t);
    layout.y = lerp(layout1.y, layout2.y, t);

    return layout;
}

function intersection(a, b) {
    return a.filter(val => b.includes(val));
}

function difference(a, b) {
    return a.filter(val => !b.includes(val));
}

class AnimatedLayout {
    constructor(startLayout, endLayout, updateCallback, completionCallback) {
        Object.assign(this, { startLayout, endLayout, updateCallback, completionCallback });

        this.currentLayout = startLayout;

        const startIds = startLayout.children.map(layout => layout.id);
        const endIds = endLayout.children.map(layout => layout.id);

        const fadeOutIds = difference(startIds, endIds);
        const lerpIds = intersection(startIds, endIds);
        const fadeInIds = difference(endIds, startIds);

        this.transitions = [];

        if (fadeOutIds.length > 0) {
            this.transitions.push({
                type: 'fade-out',
                ids: fadeOutIds
            });
        }

        if (lerpIds.length > 0) {
            // TODO: check if all of the positions are the same
            this.transitions.push({
                type: 'lerp',
                ids: lerpIds
            });
        }

        if (fadeInIds.length > 0) {
            this.transitions.push({
                type: 'fade-in',
                ids: fadeInIds
            });
        }
    }

    start() {
        this.t = 0;
        requestAnimationFrame(() => this.update());
    }

    update() {
        if (this.t < 1) {
            if (this.updateCallback) {
                this.updateCallback();
            }

            requestAnimationFrame(() => this.update());
        } else {
            this.t = 1.0;
            if (this.updateCallback) {
                this.updateCallback();
            }

            this.transitions.shift();

            if (this.transitions.length > 0) {
                this.t = 0;
                requestAnimationFrame(() => this.update());
            } else {
                if (this.completionCallback) {
                    this.completionCallback();
                }
            }
        }
    }

    hitTest() {
        return null;
    }

    render(ctx, maxId) {
        const transition = this.transitions[0];
        if (transition) {

            if (transition.type === 'fade-out') {
                ctx.save();
                ctx.translate(this.startLayout.x, this.startLayout.y);

                const k = 1.0 - this.t;

                for (const child of this.startLayout.children) {
                    if (transition.ids.includes(child.id)) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${k})`;
                    } else {
                        ctx.fillStyle = `rgba(0, 0, 0, 1.0)`;
                    }

                    child.render(ctx, maxId);
                }

                ctx.restore();

                this.t += 0.1;
            } else if (transition.type === 'lerp') {

                const layout = lerpLayout(this.startLayout, this.endLayout, transition.ids, easeCubic(this.t));
                layout.padding = 6;
                layout.padding = 6;
                this.currentLayout = layout;
                layout.render(ctx);

                this.t += 0.035;

            } else if (transition.type === 'fade-in') {
                this.currentLayout = this.endLayout;

                ctx.save();
                ctx.translate(this.endLayout.x, this.endLayout.y);

                const k = this.t;

                for (const child of this.endLayout.children) {
                    if (transition.ids.includes(child.id)) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${k})`;
                    } else {
                        ctx.fillStyle = `rgba(0, 0, 0, 1.0)`;
                    }

                    // TODO: pass in opacity
                    child.render(ctx, maxId, k);
                }

                ctx.restore();
                this.t += 0.1;
            }
        }
    }

    get bounds() {
        // TODO: check if the intermediary bounds' dimensions are smaller than either the start or end
        // FIXME: this is a hacky way to ensure that replacement animations don't transition to a layout without a deominator
        // ideally we should identify those changes where none of the lerp id nodes change
        const startBounds = this.startLayout.bounds;
        const endBounds = this.endLayout.bounds;
        if (startBounds.width === endBounds.width && startBounds.height === endBounds.height) {
            return endBounds;
        }
        return this.currentLayout.bounds;
    }
}

export {
    lerp, lerpLayout, easeQuadratic, easeCubic, easeInCubic, easeOutCubic,
    AnimatedLayout as default
};
