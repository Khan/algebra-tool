/**
 * Cancel equivalent terms in a expression, e.g. 2x + 5 - 2x - 5.
 * The user must select the two terms they want to cancel.
 */

const { Literal, Negation } = require('../ast.js');
const { compare } = require('../ast/node-utils.js');

const isNegative = function(node) {
    if (node.type === 'Literal' && node.value < 0) {
        return true;
    } else if (node.type === 'Negation') {
        return true;
    } else if (node.type === 'Product') {
        return isNegative(node.first);
    }
};

const abs = function(node) {
    if (node.type === 'Literal' && node.value < 0) {
        return new Literal(-node.value);
    } else if (node.type === 'Negation') {
        return node.value;
    } else {
        return node;
    }
};

function canTransform(selections) {
    if (selections.length !== 2) {
        return false;
    }

    const [aSel, bSel] = selections;

    // only a single term in the expression should be selected
    if (aSel.length !== 1 || bSel.length !== 1) {
        return false;
    }

    const a = aSel.toExpression();
    const b = bSel.toExpression();

    // TODO: handle negative terms
    // TODO: handle terms that are products
    if (a.parent === b.parent && a.parent.type === 'Expression') {
        if (a.prev && a.prev.operator === '+' || !a.prev) {
            return b.prev && b.prev.operator === '-' && compare(a,b);
        } else if (b.prev && b.prev.operator === '+' || !b.prev) {
            return a.prev && a.prev.operator === '-' && compare(a,b);
        }
    }

    return false;
}

function doTransform(selections) {
    if (!canTransform(selections)) {
        return;
    }

    const parent = selections[0].first.parent;

    selections.forEach(selection => {
        // assume that the previous item is an operator
        if (selection.first.prev) {
            parent.remove(selection.first.prev);
        } else if (selection.first.next) {
            // prevent the situation where we end up with an operation
            // at the start of the resulting expression
            parent.remove(selection.first.next);
        }
        parent.remove(selection.first);
    });

    // if we've canceled all terms make sure a 0 remains
    if (parent.children.length === 0) {
        parent.children.append(new Literal(0));
    }
}

// tests
// 2x + 5 - 2x - 5
// 2x + 5 + (-2x) + (-5)    // not working yet

module.exports = {
    label: 'cancel',
    canTransform,
    doTransform
};
