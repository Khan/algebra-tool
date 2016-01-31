import { generateId } from './node-utils';
import Node from './node';

export default class Operator extends Node {
    constructor(operator) {
        super();
        this.type = 'Operator';
        this.operator = operator;
    }

    toString() {
        return `${this.type}:${this.operator}`;
    }

    clone(uniqueId = false) {
        const copy = Object.create(Operator.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.operator = this.operator;
        return copy;
    }
}
