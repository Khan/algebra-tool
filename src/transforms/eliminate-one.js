const { Literal, Operator } = require('../ast.js');

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.type === 'range') {
        return false;
    }
    const node = selection.first;
    if (node.type === 'Literal' && parseFloat(node.value) === 1) {
        if (node.next && node.prev) {
            return node.next.operator === '*' && node.prev.operator === '*';
        } else if (node.next) {
            return node.next.operator === '*';
        } else if (node.prev) {
            return node.prev.operator === '*';
        } else {
            return false;
        }
    }
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    const node = selection.first;
    const { parent, next, prev } = node;

    if (next) {
        parent.remove(next);
    }

    if (prev) {
        parent.remove(prev);
    }

    if (next && prev) {
        parent.replace(node, new Operator('*'));
    } else {
        parent.remove(node);
    }

    if (parent.first === parent.last) {
        parent.parent.replace(parent, parent.first);
    }
}

module.exports = {
    label: 'eliminate',
    canTransform,
    doTransform,
};
