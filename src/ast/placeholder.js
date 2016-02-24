import Node, { generateId } from './node';

export default class Placeholder extends Node {
    constructor() {
        super();
        this.type = 'Placeholder';
        this.text = '';
    }

    toString() {
        return `${this.type}:${this.name}`;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            text: this.text,
        };
    }

    clone(uniqueId = false) {
        const copy = Object.create(Placeholder.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.text = this.text;
        return copy;
    }
}
