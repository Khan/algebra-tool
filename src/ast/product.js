import f from 'functify';

import Node, { generateId } from './node';
import List from './list';

export default class Product extends Node {
    constructor(...nodes) {
        super();
        this.type = 'Product';
        this.children = new List(this, ...nodes);
    }

    toString() {
        return `${this.type}:${this.children.toString()}`;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            children: [...f(this.children).map(child => child.toJSON())],
        };
    }

    clone(uniqueId = false) {
        const copy = Object.create(Product.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.children = new List(copy, ...f(this.children).map(x => x.clone(uniqueId)));
        return copy;
    }

    removeSelection(selection, keepOperators = false) {
        if (selection.first.parent === this && selection.last.parent === this) {
            const nodes = [...selection];

            for (const node of nodes) {
                this.remove(node);
            }

            if (!keepOperators) {
                if (this.first.type === 'Operator') {
                    this.remove(this.first);
                }
                if (this.last.type === 'Operator') {
                    this.remove(this.last);
                }

                let duplicateOperator = null;
                let i = 0;
                for (const node of this) {
                    if (i++ % 2 === 0 && node.type === 'Operator') {
                        if (!duplicateOperator) {
                            duplicateOperator = node;
                        }
                    }
                }
                if (duplicateOperator) {
                    this.remove(duplicateOperator);
                }
            }
        }
    }

    // TODO: create a class decorator to specify which methods to proxy
    insertAfter(newNode, referenceNode) {
        this.children.insertAfter(newNode, referenceNode);
    }

    insertBefore(newNode, referenceNode) {
        this.children.insertBefore(newNode, referenceNode);
    }

    remove(node) {
        this.children.remove(node);
    }

    replace(node, value) {
        this.children.replace(node, value);
    }

    get first() {
        return this.children.first;
    }

    set first(value) {
        this.children.first = value;
    }

    get last() {
        return this.children.last;
    }

    set last(value) {
        this.children.last = value;
    }

    // TODO have a validate method
}
