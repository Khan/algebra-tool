const { Negation, Literal } = require('../ast.js');

function canTransform(selections) {
    // TODO: handle a * -1 * b -> a * -b
    // TODO: handle b * -1 -> -b
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.type === 'range') {
        return false;
    }
    const node = selection.first;
    if (node.type === 'Product' && node.children.length === 3) {
        return (node.first.type === 'Literal' &&
                parseFloat(node.first.value) === -1);
    }
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    const node = selection.first;
    if (node.last.type === 'Literal' && node.last.value > 0) {
        node.parent.replace(node, new Literal(-node.last.value));
    } else {
        const replacement = new Negation(node.last.clone());
        node.parent.replace(node, replacement);
    }
}

module.exports = {
    label: 'rewrite as negation',
    canTransform,
    doTransform
};
