const fontMetrics = require("../../metrics/helvetica-light.json");
const {unitsPerEm, glyphMetrics} = fontMetrics;

export default class Font {
    constructor(size) {
        this.size = size;

        this.ascent = this.getAscent(size);
        this.descent = this.getDescent(size);
    }

    getMetrics(c) {
        const result = {};
        for (const [k, v] of Object.entries(glyphMetrics[c.charCodeAt(0)])) {
            result[k] = this.size * v / unitsPerEm;
        }
        return result;
    }

    getAscent() {
        const TMetrics = this.getMetrics('T');
        const descent = this.getDescent(this.size);
        return -TMetrics.height - descent; // negative y values are above the baseline
    }

    getDescent() {
        const yMetrics = this.getMetrics('y');
        return -yMetrics.bearingY;
    }

    toStyle() {
        return `${this.size}px Helvetica-Light`;
    }
}
