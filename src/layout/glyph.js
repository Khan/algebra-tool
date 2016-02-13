import Rect from './rect';

class Glyph {
    constructor(c, font) {
        this.x = 0;
        this.y = 0;
        this.text = c;
        this.font = font.size;
        this.selectable = true;
        this.ascent = font.ascent;
        this.descent = font.descent;
        this.atomic = true;
        this.metrics = font.getMetrics(c);
        this.advance = this.metrics.advance;
        this.font = font;
    }

    render(ctx, maxId) {
        // TODO when we flatten group all of the items with the same fontSize
        //if (this.id && RenderOptions.bounds) {
        //    ctx.strokeStyle = 'red';
        //    const bounds = this.bounds;
        //    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        //}

        if (this.id > maxId) {
            ctx.fillStyle = 'rgb(0,192,192)';
            ctx.strokeStyle = 'rgb(0,192,192)';
        }

        ctx.font = this.font.toStyle();
        ctx.fillText(this.text, this.x, this.y);

        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
    }

    get bounds() {
        const {bearingX, bearingY, width, height} = this.metrics;
        const x = this.x + bearingX;
        const y = this.y - bearingY - height;  // glyph coords are opposite canvas coords
        const result = new Rect(x, y, width, height);
        return result;
    }

    clone() {
        const result = new Glyph(this.text, this.font);
        Object.assign(result, this);
        return result;
    }

    hitTest(x, y) {
        return this.bounds.contains(x,y) ? this : null;
    }
}

export { Glyph as default };
