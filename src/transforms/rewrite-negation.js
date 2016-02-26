const { Literal, Operator, Product } = require('../ast.js');

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.type === 'range') {
        return false;
    }
    const node = selection.first;
    return node.type === 'Negation' ||
        node.type === 'Literal' && node.value < 0;
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    const node = selection.first;
    const parent = node.parent;
    if (parent.type === 'Product') {
        parent.insertBefore(new Literal(-1), node);
        parent.insertBefore(new Operator('*'), node);
        if (node.type === 'Negation') {
            parent.replace(node, node.value);
        } else if (node.type === 'Literal') {
            parent.replace(node, new Literal(-node.value));
        }
    } else {
        if (node.type === 'Negation') {
            parent.replace(node, new Product(new Literal(-1), new Operator('*'), node.value));
        } else if (node.type === 'Literal') {
            parent.replace(node, new Product(new Literal(-1), new Operator('*'), new Literal(-node.value)));
        }
    }
}

module.exports = {
    label: 'rewrite negation',
    canTransform,
    doTransform
};
