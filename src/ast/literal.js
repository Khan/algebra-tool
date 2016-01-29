const {generateId} = require('./node-utils');
const Node = require('./node');

class Literal extends Node {
    constructor(value) {
        super();
        this.type = 'Literal';
        this.value = String(value);
    }

    toString() {
        return `${this.type}:${this.value}(${this.id})`;
    }

    clone(uniqueId = false) {
        var copy = Object.create(Literal.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.value = this.value;
        return copy;
    }
}

module.exports = Literal;
