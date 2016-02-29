import { Expression, Product } from '../ast';
import { findNode, getPath, findCommonAncestor } from '../ast/node-utils';

class Selection {
    constructor(first, last = first) {
        Object.assign(this, { first, last });
    }

    *[Symbol.iterator]() {
        // TODO: check if they have the same parent
        let node = this.first;
        while (node != this.last) {
            let current = node;
            node = node.next;
            yield current;
        }
        yield this.last;
    }

    get length() {
        let count = 0;
        for (let node of this) {
            count++;
        }
        return count;
    }

    includes(node) {
        for (const child of this) {
            if (findNode(child, node.id)) {
                return true;
            }
        }
        return false;
    }

    intersects(selection) {
        for (const node of this) {
            if (selection.includes(node)) {
                return true;
            }
        }
        for (const node of selection) {
            if (this.includes(node)) {
                return true;
            }
        }
        return false
    }

    add(mathNode) {
        let parent = this.first.parent;

        if (parent !== mathNode.parent) {
            const ancestor = findCommonAncestor(parent, mathNode);
            const parentPath = getPath(parent);
            const mathNodePath = getPath(mathNode);

            const aNode = parentPath.find(node => node.parent === ancestor);
            const bNode = mathNodePath.find(node => node.parent === ancestor);

            if (aNode) {
                this.first = aNode;
                this.last = aNode;
            }
        }

        if (['Expression', 'Product'].includes(parent.type) && findNode(parent, mathNode.id)) {
            const children = parent.children;

            // handles the case of selection a number times a fraction
            for (const node of children) {
                if (node !== mathNode && findNode(node, mathNode.id)) {
                    mathNode = node;
                }
            }

            if (children.indexOf(mathNode) < children.indexOf(this.first)) {
                this.first = mathNode;
            }

            if (children.indexOf(mathNode) > children.indexOf(this.last)) {
                this.last = mathNode;
            }

            // if we've selected all terms in the expression or all
            // factors in the product, select the parent instead
            if (this.first === children.first && this.last === children.last) {
                this.first = parent;
                this.last = parent;
            }
        } else if (this.first.parent.type === 'Fraction') {
            if (!findNode(this.first, mathNode.id)) {
                if (findNode(parent, mathNode.id)) {
                    this.first = parent;
                    this.last = parent;
                }
            }
        }
    }

    clone() {
        return new Selection(this.first, this.last);
    }

    toExpression() {
        if (this.length === 1) {
            return this.first;
        } else {
            if (this.first.parent.type === 'Product' && this.first.parent === this.last.parent) {
                const product = new Product();
                product.first = this.first;
                product.last = this.last;
                product.parent = this.first.parent;
                return product;
            } else if (this.first.parent.type === 'Expression' && this.first.parent === this.last.parent) {
                const expression = new Expression();
                expression.children.first = this.first;
                expression.children.last = this.last;
                expression.parent = this.first.parent;
                return expression;
            } else {
                throw new Error('toExpression failed');
            }
        }
    }
}

export { Selection as default };
