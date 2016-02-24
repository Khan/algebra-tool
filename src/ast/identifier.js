import Node, { generateId } from './node';

export default class Identifier extends Node {
    constructor(name, options = {}) {
        super();
        this.type = 'Identifier';
        this.name = name;
        this.subscript = options.subscript || null;
        this.accent = options.accent || null;
    }

    toString() {
        return `${this.type}:${this.name}`;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            name: this.name,
        };
    }

    clone(uniqueId = false) {
        const copy = Object.create(Identifier.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.name = this.name;
        copy.subscript = this.subscript;
        copy.accent = this.accent;
        return copy;
    }
}
