import Rect from './rect';

const fontMetrics = require("../../metrics/helvetica-light.json");
const {unitsPerEm, glyphMetrics} = fontMetrics;

function getMetrics(c, fontSize) {
    const result = {};
    for (const [k, v] of Object.entries(glyphMetrics[c.charCodeAt(0)])) {
        result[k] = fontSize * v / unitsPerEm;
    }
    return result;
}

function getAscent(fontSize) {
    const TMetrics = getMetrics('T', fontSize);
    const descent = getDescent(fontSize);
    return -TMetrics.height - descent; // negative y values are above the baseline
}

function getDescent(fontSize) {
    const yMetrics = getMetrics('y', fontSize);
    return -yMetrics.bearingY;
}

export default class Glyph {
    constructor(c, fontSize, metrics = getMetrics(c, fontSize)) {
        this.x = 0;
        this.y = 0;
        this.text = c;
        this.fontSize = fontSize;
        this.selectable = true;
        this.ascent = getAscent(fontSize);
        this.descent = getDescent(fontSize);
        this.atomic = true;
        this.metrics = metrics;
        this.advance = this.metrics.advance;
    }

    render(ctx) {
        // TODO when we flatten group all of the items with the same fontSize
        //if (this.id && RenderOptions.bounds) {
        //    ctx.strokeStyle = 'red';
        //    const bounds = this.bounds;
        //    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        //}

        const weight = 100;
        ctx.font = `${weight} ${this.fontSize}px Helvetica`;
        ctx.fillText(this.text, this.x, this.y);
    }

    get bounds() {
        const {bearingX, bearingY, width, height} = this.metrics;
        const x = this.x + bearingX;
        const y = this.y - bearingY - height;  // glyph coords are opposite canvas coords
        return new Rect(x, y, width, height);
    }

    clone() {
        const result = new Glyph(this.text, this.fontSize);
        Object.assign(result, this);
        return result;
    }

    hitTest(x, y) {
        return this.bounds.contains(x,y) ? this : null;
    }
}
