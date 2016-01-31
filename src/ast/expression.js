import f from 'functify';

import { generateId } from './node-utils';
import ListNode from './list-node';

export default class Expression extends ListNode {
    constructor(...nodes) {
        super();
        this.type = 'Expression';
        this.append(...nodes);
    }

    toString() {
        return `${this.type}:${super.toString()}`;
    }

    clone(uniqueId = false) {
        const copy = Object.create(Expression.prototype);
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
