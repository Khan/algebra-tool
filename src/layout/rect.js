
export default class Rect {
    constructor(x, y, width, height) {
        Object.assign(this, {x, y, width, height});
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.width;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.height;
    }

    contains(x, y) {
        const {left, right, top, bottom} = this;
        return x >= left && x <= right && y >= top && y <= bottom;
    }

    static union(rects) {
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        for (const rect of rects) {
            left = Math.min(left, rect.left);
            right = Math.max(right, rect.right);
            top = Math.min(top, rect.top);
            bottom = Math.max(bottom, rect.bottom);
        }

        const x = left;
        const y = top;
        const width = right - left;
        const height = bottom - top;

        return new Rect(x, y, width, height);
    }

    addPadding(dx, dy) {
        return new Rect(this.x - dx, this.y - dy, this.width + 2 * dx, this.height + 2 * dy);
    }
}
