import Node, { generateId } from './node';

export default class Placeholder extends Node {
    constructor() {
        super();
        this.type = 'Placeholder';
        this.text = "5";
    }

    toString() {
        return `${this.type}:${this.name}`;
    }

    clone(uniqueId = false) {
        const copy = Object.create(Placeholder.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.text = this.text;
        return copy;
    }
}
