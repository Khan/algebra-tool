const {generateId} = require('./node-utils');
const Node = require('./node');

class Math extends Node {
    constructor(root) {
        super();
        this.type = 'Math';
        this.root = root;
        this.root.parent = this;
    }

    toString() {
        return `[${this.type}:${this.root}]`;
    }

    clone(uniqueId = false) {
        const clone = Object.create(Math.prototype);
        clone.id = uniqueId ? generateId() : this.id;
        clone.type = this.type;
        clone.root = this.root.clone(uniqueId);
        clone.root.parent = clone;
        return clone;
    }

    replace(current, replacement) {
        if (this.root === current) {
            this.root = replacement;
            replacement.parent = this;
            current.parent = null;
        }
    }
}

module.exports = Math;
