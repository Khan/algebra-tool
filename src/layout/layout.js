import Rect from './rect';
import Box from './box';
import Glyph from './glyph';
import Font from './font';

const RenderOptions = {
    bounds: false
};

function formatText(text, parens) {
    if (parseFloat(text) < 0 && parens) {
        text = `(${text})`;
    }
    return String(text).replace(/\-/g, "\u2212").replace(/\*/g, "\u00B7");
}

class Layout {
    constructor(children, atomic = false) {
        this.type = 'layout';
        this.x = 0;
        this.y = 0;
        this.selectable = true;
        this.padding = 0;
        Object.assign(this, {children, atomic});
    }

    render(ctx, options = {}) {
        const { maxId = Infinity } = options;

        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.atomic && RenderOptions.bounds) {
            ctx.strokeStyle = 'red';
            const bounds = this.bounds;
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }

        if (this.id > maxId) {
            ctx.fillStyle = 'rgb(0,208,208)';
            ctx.strokeStyle = 'rgb(0,208,208)';
        }

        for (const child of this.children) {
            child.render(ctx, options);
        }

        ctx.fillStyle = options.color
        ctx.strokeStyle = options.color;
        ctx.restore();
    }

    get bounds() {
        if (this.children.length === 0) {
            return new Rect(this.x - this.padding, this.y - this.padding, 2 * this.padding, 2 * this.padding);
        }
        const bounds = Rect.union(this.children.map(child => child.bounds));
        bounds.x += this.x;
        bounds.y += this.y;
        bounds.x -= this.padding;
        bounds.y -= this.padding;
        bounds.width += 2 * this.padding;
        bounds.height += 2 * this.padding;
        return bounds;
    }

    clone() {
        const result = new Layout(this.children.map(child => child.clone()), this.atomic);
        result.id = this.id;
        result.x = this.x;
        result.y = this.y;
        result.font = this.font;
        return result;
    }

    hitTest(x, y) {
        if (this.atomic) {
            let bounds = this.bounds;

            let paddingX = 2;
            let paddingY = 2;
            if (bounds.width < 14) {
                paddingX += (14 - bounds.width) / 2;
            }

            bounds = bounds.addPadding(paddingX, paddingY);
            return bounds.contains(x, y) ? this : null;
        }

        for (const child of this.children) {
            const result = child.hitTest(x - this.x, y - this.y);
            if (result) {
                return result;
            }
        }
    }
}


function formatIdentifier(identifier) {
    if (identifier.length > 1) {
        // TODO: have a fallback when we don't have the glyph
        if (identifier === 'pi') {
            return '\u03C0';
        } else if (identifier === 'theta') {
            return '\u03B8';
        }
    }
    return identifier;
}


function makeMetricsSquare(metrics) {
    if (metrics.width >= metrics.height) {
        const vPad = (metrics.width - metrics.height) / 2;
        return {
            bearingX: metrics.bearingX,
            bearingY: metrics.bearingY - vPad,
            width: metrics.width,
            height: metrics.height + 2 * vPad
        };
    } else {
        const hPad = (metrics.height - metrics.width) / 2;
        return {
            bearingX: metrics.bearingX - hPad,
            bearingY: metrics.bearingY,
            width: metrics.width + 2 * hPad,
            height: metrics.height
        };
    }
}

function startsExpression(node) {
    return node.parent.type === 'Expression' && node.parent.first !== node ||
        node.parent.parent && node.parent.parent.type === 'Expression' && node.parent.parent.first !== node.parent;
}


function createLayout(node, fontSize) {
    const font = new Font(fontSize);

    const spaceGlyph = new Glyph(' ', font);
    const dashGlyph = new Glyph('\u2212', font);
    const spaceMetrics = spaceGlyph.metrics;
    const dashMetrics = dashGlyph.metrics;

    if (node.type === "Literal") {
        const parens = startsExpression(node) || node.parent.type === "Product" && node.parent.first !== node;
        const text = formatText(String(node.value), parens);

        let penX = 0;
        const layouts = [];

        for (const c of text) {
            const glyph = new Glyph(c, font);

            glyph.x = penX;
            penX += glyph.advance;

            layouts.push(glyph);
        }

        const layout = new Layout(layouts, true);
        layout.advance = penX;
        layout.id = node.id;

        layout.ascent = font.ascent;
        layout.descent = font.descent;
        layout.font = font;

        return layout;
    } else if (node.type === "Identifier") {
        const name = formatIdentifier(node.name);
        // TODO handle multi character identifiers such as sin, cos, tan, etc.
        const glyph = new Glyph(name, font);
        glyph.id = node.id;
        return glyph;
    } else if (node.type === "Negation") {
        const children = [];
        let penX = 0;

        if (startsExpression(node)) {
            const lParen = new Glyph("(", font);
            lParen.x = penX;
            lParen.id = node.id + ":(outer";
            lParen.selectable = false;
            penX += lParen.advance;
            children.push(lParen);
        }

        const negativeSign = new Glyph("\u2212", font);
        negativeSign.x = penX;
        negativeSign.id = node.id + ":-";
        penX += negativeSign.advance;
        children.push(negativeSign);

        if (["Expression", "Product"].includes(node.value.type)) {
            const lParen2 = new Glyph("(", font);
            lParen2.x = penX;
            lParen2.id = node.id + ":(inner";
            penX += lParen2.advance;
            children.push(lParen2);
        }

        const valueLayout = createLayout(node.value, fontSize);
        valueLayout.x = penX;
        penX += valueLayout.advance;
        children.push(valueLayout);

        if (["Expression", "Product"].includes(node.value.type)) {
            const rParen2 = new Glyph(")", font);
            rParen2.x = penX;
            rParen2.id = node.id + ":)inner";
            penX += rParen2.advance;
            children.push(rParen2);
        }

        if (startsExpression(node)) {
            const rParen = new Glyph(")", font);
            rParen.x = penX;
            rParen.id = node.id + ":)outer";
            rParen.selectable = false;
            penX += rParen.advance;
            children.push(rParen);
        }

        const layout = new Layout(children);

        layout.advance = penX;
        layout.id = node.id;
        layout.ascent = valueLayout.ascent;
        layout.descent = valueLayout.descent;

        return layout;
    } else if (node.type === "Operator") {
        const operator = formatText(node.operator);
        const glyph = new Glyph(operator, font);
        if (node.operator === "-") {
            glyph.metrics = makeMetricsSquare(glyph.metrics);
        }
        if (node.operator === "*") {
            // TODO: make some methods for center bounds and getting their centers
            const centerX = glyph.metrics.bearingX + glyph.metrics.width / 2;
            const centerY = glyph.metrics.bearingY + glyph.metrics.height / 2;
            const radius = glyph.metrics.width;
            glyph.metrics.bearingX = centerX - radius;
            glyph.metrics.bearingY = centerY - radius;
            glyph.metrics.width = 2 * radius;
            glyph.metrics.height = 2 * radius;
        }
        glyph.id = node.id;
        glyph.circle = true;
        return glyph;
    } else if (node.type === "Expression") {
        let penX = 0;
        let ascent = 0;
        let descent = 0;

        const layouts = [];

        for (const child of node.children) {
            const childLayout = createLayout(child, fontSize);

            if (child.type === "Operator") {
                penX += spaceMetrics.advance / 1.5;
            } else if (child.type === "Expression") {
                const lParen = new Glyph("(", font);
                lParen.x = penX;
                lParen.id = child.id + ":(";
                lParen.selectable = false;
                penX += lParen.advance;
                layouts.push(lParen);
            }

            childLayout.x = penX;
            penX += childLayout.advance;

            if (child.type === "Operator") {
                penX += spaceMetrics.advance / 1.5;
            } else if (child.type === "Expression") {
                const rParen = new Glyph(")", font);
                rParen.x = penX;
                rParen.id = child.id + ":)";
                rParen.selectable = false;
                penX += rParen.advance;
                layouts.push(rParen);
            }

            if (childLayout.hasOwnProperty('ascent')) {
                ascent = Math.min(childLayout.ascent, ascent);
            }
            if (childLayout.hasOwnProperty('descent')) {
                descent = Math.max(childLayout.descent, descent);
            }

            layouts.push(childLayout);
        }

        const layout = new Layout(layouts);

        layout.advance = penX;
        layout.id = node.id;
        layout.ascent = ascent;
        layout.descent = descent;

        return layout;
    } else if (node.type === "Equation") {
        let penX = 0;

        const lhs = createLayout(node.left, fontSize);
        lhs.x = penX;
        penX += lhs.advance;

        // TODO: update Equation to handle inequalities
        const equal = new Glyph("=", font);
        equal.circle = true;
        equal.metrics = makeMetricsSquare(equal.metrics);
        // TODO: figure out how to differentiate between layout and equal node
        equal.id = node.id;
        penX += spaceMetrics.advance;
        equal.x = penX;
        penX += equal.advance + spaceMetrics.advance;

        const rhs = createLayout(node.right, fontSize);
        rhs.x = penX;
        penX += rhs.advance;

        const layout = new Layout([lhs, equal, rhs]);
        layout.advance = penX;
        layout.id = node.id;
        return layout;
    } else if (node.type === "Fraction") {
        const num = createLayout(node.numerator, fontSize);
        const den = createLayout(node.denominator, fontSize);

        const thickness = dashMetrics.height;
        const y = -dashMetrics.bearingY - thickness;

        const gap = 3;
        // y is the top of the fraction bar
        num.y = y + num.y - num.descent - gap;
        den.y = -dashMetrics.bearingY + den.y - den.ascent + gap;

        // TODO: calc width so that we can use width where it makes sense
        if (den.advance > num.advance) {
            num.x += (den.advance - num.advance) / 2;
        } else {
            den.x += (num.advance - den.advance) / 2;
        }

        const padding = 0.1 * fontSize;

        num.x += padding;
        den.x += padding;

        const width = Math.max(num.advance, den.advance) + 2 * padding;
        const bar = new Box(0, y, width, thickness);
        bar.id = node.id + ":line";

        const layout = new Layout([num, den, bar]);
        layout.advance = width;
        layout.id = node.id;

        layout.ascent = num.y + num.ascent;
        layout.descent = den.y + den.descent;

        return layout;
    } else if (node.type === "Product") {
        let penX = 0;
        let ascent = 0;
        let descent = 0;

        const layouts = [];

        for (let child of node.children) {
            // TODO: handle multiple numbers and numbers that come in the middle
            if (child.type === "Expression" || child.type === "Product") {
                const lParen = new Glyph("(", font);
                lParen.x = penX;
                lParen.id = child.id + ":(";
                lParen.selectable = false;
                penX += lParen.advance;
                layouts.push(lParen);
            }
            const childLayout = createLayout(child, fontSize);

            if (childLayout.hasOwnProperty('ascent')) {
                ascent = Math.min(childLayout.ascent, ascent);
            }
            if (childLayout.hasOwnProperty('descent')) {
                descent = Math.max(childLayout.descent, descent);
            }

            if (child.type === "Operator") {
                penX += spaceMetrics.advance / 1.5;
            }

            childLayout.x = penX;
            penX += childLayout.advance;

            if (child.type === "Operator") {
                penX += spaceMetrics.advance / 1.5;
            }

            layouts.push(childLayout);
            if (child.type === "Expression" || child.type === "Product") {
                const rParen = new Glyph(")", font);
                rParen.x = penX;
                rParen.id = child.id + ":)";
                rParen.selectable = false;
                penX += rParen.advance;
                layouts.push(rParen);
            }
        }
        const layout = new Layout(layouts);

        layout.advance = penX;
        layout.id = node.id;

        layout.ascent = ascent;
        layout.descent = descent;

        return layout;
    } else if (node.type === 'Math') {
        return createLayout(node.root, fontSize);
    } else if (node.type === 'Placeholder') {
        let penX = 0;
        const layouts = [];

        for (const c of node.text) {
            const glyph = new Glyph(c, font);

            glyph.x = penX;
            penX += glyph.advance;

            layouts.push(glyph);
        }

        const layout = new Layout(layouts, true);
        layout.advance = penX;
        layout.id = node.id;

        layout.ascent = font.ascent;
        layout.descent = font.descent;
        layout.font = font;

        // TODO: eventually all the user to move the cursor position

        return layout;

        //const box = new Box(0, 0 - 0.85 * fontSize, fontSize, fontSize, true);
        //box.ascent = -0.85 * fontSize;
        //box.descent = 0.15 * fontSize;
        //box.id = node.id;
        //return box;
    } else {
        throw Error(`unrecogized node '${node.type}`);
    }
}

function flatten(layout, dx = 0, dy = 0, result = []) {
    if (layout.atomic) {
        layout = layout.clone();
        layout.x += dx;
        layout.y += dy;
        result.push(layout);
    } else if (layout.children) {
        dx += layout.x;
        dy += layout.y;
        for (const child of layout.children) {
            flatten(child, dx, dy, result);
        }
    } else {
        const glyph = layout.clone();
        glyph.x += dx;
        glyph.y += dy;
        result.push(glyph);
    }
    return result;
}

function createFlatLayout(node, fontSize, padding = 2) {
    let newLayout = createLayout(node, fontSize);
    let flattenedLayout = new Layout(flatten(newLayout));

    function findEqual(flatLayout) {
        for (const child of flatLayout.children) {
            if (child.text === "=") {
                return child;
            }
        }
    }

    function translateLayout(flatLayout, dx, dy) {
        for (const child of flatLayout.children) {
            child.x += dx;
            child.y += dy;
        }
    }

    flattenedLayout.padding = padding;
    const bounds = flattenedLayout.bounds;
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;

    const centerX = width / 2;
    const centerY = height / 2;

    const dx = centerX - (bounds.left + bounds.right) / 2;
    const dy = centerY - (bounds.top + bounds.bottom) / 2;

    translateLayout(flattenedLayout, dx, dy);

    return flattenedLayout;
}

export { createFlatLayout, Layout, RenderOptions };
