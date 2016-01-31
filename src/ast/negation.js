import Node, { generateId } from './node';

export default class Negation extends Node {
    constructor(value) {
        super();
        this.type = 'Negation';
        this.value = value; // TODO: come up with a better name
        this.value.parent = this;
    }

    toString() {
        return `[${this.type}:${this.value}]`;
    }

    clone(uniqueId = false) {
        const copy = Object.create(Negation.prototype);
        copy.id = uniqueId ? generateId() : this.id;
        copy.type = this.type;
        copy.value = this.value.clone(uniqueId);
        copy.value.parent = copy;
        return copy;
    }

    replace(current, replacement) {
        if (this.value === current) {
            this.value = replacement;
            replacement.parent = this;
            current.parent = null;
        }
    }
}
