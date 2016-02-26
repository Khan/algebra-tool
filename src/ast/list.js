export default class List {
    constructor(owner, ...nodes) {
        this.owner = owner;
        this.first = null;
        this.last = null;
        this.append(...nodes);
    }

    append(...nodes) {
        for (let node of nodes) {
            node.next = null;
            node.parent = this.owner;
            if (this.first == null && this.last == null) {
                this.first = node;
                this.last = node;
                node.prev = null;
            } else {
                this.last.next = node;
                node.prev = this.last;
                this.last = node;
            }
        }
    }

    prepend(...nodes) {
        // TODO: determine if nodes should be reversed or not
        for (let node of nodes) {
            node.prev = null;
            node.parent = this.owner;
            if (this.first == null && this.last == null) {
                this.first = node;
                this.last = node;
                node.next = null;
            } else {
                this.first.prev = node;
                node.next = this.first;
                this.first = node;
            }
        }
    }

    insertAfter(newNode, referenceNode) {
        newNode.next = referenceNode.next;
        newNode.prev = referenceNode;
        if (referenceNode.next) {
            referenceNode.next.prev = newNode;
        }
        referenceNode.next = newNode;
        if (referenceNode === this.last) {
            this.last = newNode;
        }
        newNode.parent = this.owner;
    }

    insertBefore(newNode, referenceNode) {
        newNode.prev = referenceNode.prev;
        newNode.next = referenceNode;
        if (referenceNode.prev) {
            referenceNode.prev.next = newNode;
        }
        referenceNode.prev = newNode;
        if (referenceNode === this.first) {
            this.first = newNode;
        }
        newNode.parent = this.owner;
    }

    replace(current, replacement) {
        replacement.prev = current.prev;
        replacement.next = current.next;
        if (current.prev != null) {
            current.prev.next = replacement;
        }
        if (current.next != null) {
            current.next.prev = replacement;
        }
        current.prev = null;
        current.next = null;
        if (this.first === current) {
            this.first = replacement;
        }
        if (this.last === current) {
            this.last = replacement;
        }
        replacement.parent = this.owner;
    }

    remove(node) {
        if (this.first === node) {
            this.first = node.next;
            if (this.first) {
                this.first.prev = null;
            }
        } else {
            node.prev.next = node.next;
        }
        if (this.last === node) {
            this.last = node.prev;
            if (this.last) {
                this.last.next = null;
            }
        } else {
            node.next.prev = node.prev;
        }
    }

    indexOf(node) {
        let index = 0;
        for (const child of this) {
            if (node === child) {
                return index;
            }
            index++;
        }
        return -1;
    }

    at(index) {
        let i = 0;
        for (const child of this) {
            if (index === i) {
                return child;
            }
            i++;
        }
        return null;
    }

    *[Symbol.iterator]() {
        let node = this.first;
        while (node != this.last) {
            // grab the current node so that we can do replacements while
            // iterating
            let current = node;
            node = node.next;
            yield current;
        }
        if (this.last) {
            yield this.last;
        }
    }

    get length() {
        let count = 0;
        for (let node of this) {
            count++;
        }
        return count;
    }

    toString() {
        let result = "[";
        let first = true;
        for (let node of this) {
            if (!first) {
                result += ", ";
            } else {
                first = false;
            }
            result += node.toString();
        }
        result += "]";
        return result;
    }
}
