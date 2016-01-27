const {generateId} = require('./node-utils');

class Node {
    constructor() {
        this.id = generateId();
        this.parent = null;
        this.next = null;
        this.prev = null;
    }
}

module.exports = Node;
