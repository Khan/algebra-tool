const { div } = require('../operations.js');

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.type === 'range') {
        return false;
    }
    const node = selection.first;
    if (node.type === 'Product' && node.children.length === 3) {
        if (node.first.type === 'Fraction' && node.last.type !== 'Fraction') {
            const numerator = node.first.numerator;
            return (numerator.type === 'Literal' &&
                    parseFloat(numerator.value) === 1);
        }
        if (node.first.type !== 'Fraction' && node.last.type === 'Fraction') {
            const numerator = node.last.numerator;
            return (numerator.type === 'Literal' &&
                    parseFloat(numerator.value) === 1);
        }
    }
    return false;
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    const node = selection.first;
    if (node.first.type === 'Fraction' && node.last.type !== 'Fraction') {
        const replacement = div(node.last.clone(), node.first.denominator.clone());
        node.parent.replace(node, replacement);
    } else if (node.first.type !== 'Fraction' && node.last.type === 'Fraction') {
        const replacement = div(node.first.clone(), node.last.denominator.clone());
        node.parent.replace(node, replacement);
    }
}

module.exports = {
    label: 'rewrite as division',
    canTransform,
    doTransform
};
