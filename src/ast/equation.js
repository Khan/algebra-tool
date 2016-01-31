import { generateId } from './node-utils';
import Node from './node';

export default class Equation extends Node {
    constructor(left, right) {
        super();
        this.type = 'Equation';
        this.left = left;
        this.right = right;
        this.left.parent = this;
        this.right.parent = this;
    }

    toString() {
        return `${this.type}:[${this.left} = ${this.right}]`;
    }

    clone(uniqueId = false) {
        var copy = Object.create(Equation.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.left = this.left.clone(uniqueId);
        copy.right = this.right.clone(uniqueId);
        copy.left.parent = copy;
        copy.right.parent = copy;
        return copy;
    }

    replace(current, replacement) {
        if (this.left === current) {
            this.left = replacement;
            replacement.parent = this;
            current.parent = null;
        } else if (this.right === current) {
            this.right = replacement;
            replacement.parent = this;
            current.parent = null;
        }
    }
}
