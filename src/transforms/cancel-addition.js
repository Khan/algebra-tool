/**Transform 1 + (-1) -> 0
*/

const { Literal } = require('../ast.js');
const { deepEqual } = require('../ast/node-utils.js');

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
    if (selections.length !== 1) {
        return false;
    }
    let selection = selections[0];

    if (selection.length === 1 && ['Expression', 'Product'].includes(selection.first.type)) {
        selection = selection.first.children;
    }
    if (selection.length === 3) {
        const [first, operator, last] = selection;

        if (operator.operator === '+') {
            if (first.prev && first.prev.operator === '-') {
                return false;
            } else if (isNegative(first) && !isNegative(last)) {
                return deepEqual(abs(first), last);
            } else if (!isNegative(first) && isNegative(last)) {
                return deepEqual(first, abs(last));
            }
        }
    }
    return false;
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    let selection = selections[0];

    if (selection.length === 1 && ['Expression', 'Product'].includes(selection.first.type)) {
        selection = selection.first.children;
    }
    const [first, operator, last] = selection;
    const parent = operator.parent;

    parent.remove(first);
    parent.remove(last);
    parent.replace(operator, new Literal(0));
}

module.exports = {
    label: 'cancel',
    canTransform,
    doTransform
};
