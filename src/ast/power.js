import { generateId } from './node-utils';
import Node from './node';

export default class Power extends Node {
    constructor(base, exponent) {
        super();
        this.type = 'Power';
        this.base = base;
        this.exponent = exponent;
        this.base.parent = this;
        this.exponent.parent = this;
    }

    toString() {
        return `[${this.type}:${this.base}^${this.exponent}]`;
    }

    clone(uniqueId = false) {
        const copy = Object.create(Power.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.base = this.base.clone(uniqueId);
        copy.exponent = this.exponent.clone(uniqueId);
        copy.base.parent = copy;
        copy.exponent.parent = copy;
        return copy;
    }
}
