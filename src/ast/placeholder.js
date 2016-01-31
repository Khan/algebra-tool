import { generateId } from './node-utils';
import Node from './node';

export default class Placeholder extends Node {
    constructor() {
        super();
        this.type = 'Placeholder';
    }

    toString() {
        return `${this.type}:${this.name}`;
    }

    clone(uniqueId = false) {
        const copy = Object.create(Placeholder.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        return copy;
    }
}
