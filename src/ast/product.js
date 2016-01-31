const f = require('functify');

const {generateId} = require('./node-utils');
import ListNode from './list-node.js';

class Product extends ListNode {
    constructor(...nodes) {
        super();
        this.type = 'Product';
        this.append(...nodes);
    }

    toString() {
        return `${this.type}:${super.toString()}`;
    }

    clone(uniqueId = false) {
        const copy = Object.create(Product.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.append(...f(this).map(x => x.clone(uniqueId)));
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

    // TODO have a validate method
}

module.exports = Product;
