let _id = 1;

function generateId() {
    return String(_id++);
}

class Node {
    constructor() {
        this.id = generateId();
        this.parent = null;
        this.next = null;
        this.prev = null;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
        };
    }
}

export { generateId, Node as default };
