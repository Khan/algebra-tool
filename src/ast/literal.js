import Node, { generateId } from './node';

export default class Literal extends Node {
    constructor(value) {
        super();
        this.type = 'Literal';
        this.value = String(value);
    }

    toString() {
        return `${this.type}:${this.value}(${this.id})`;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            value: this.value,
        };
    }

    clone(uniqueId = false) {
        var copy = Object.create(Literal.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.value = this.value;
        return copy;
    }
}
