const { div } = require('../operations.js');

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.length === 1 && selection.first.type === 'Fraction') {
        const numerator = selection.first.numerator;

        return numerator.type === 'Expression';
    }
    return false;
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    const { numerator, denominator } = selection.first;
    const expression = numerator.clone();
    for (const node of expression.children) {
        if (node.type !== 'Operator') {
            expression.replace(node, div(node.clone(), denominator.clone(true)));
        }
    }
    selection.first.parent.replace(selection.first, expression);
}

module.exports = {
    label: 'split fraction',
    canTransform,
    doTransform,
};

