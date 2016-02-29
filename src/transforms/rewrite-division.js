const { Literal } = require('../ast.js');
const { mul, div, removeExtraProductParens } = require('../operations.js');

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.length !== 1) {
        return false;
    }
    const node = selection.first;
    return node.type === 'Fraction';
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    const node = selection.first;
    const parent = node.parent;

    parent.replace(
        node,
        mul(
            node.numerator.clone(),
            div(new Literal(1), node.denominator.clone())
        )
    );

    if (parent.type === 'Product') {
        removeExtraProductParens(parent);
    }
}

module.exports = {
    label: 'change to multiplication',
    canTransform,
    doTransform
};
