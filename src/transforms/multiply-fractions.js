const { mul, div } = require('../operations.js');

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
        if ((first.type === 'Fraction' || last.type === 'Fraction') && operator.type === 'Operator') {
            return operator.operator === '*';
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
    const [prev, node, next] = selection;
    const parent = node.parent;

    let denominator = null;
    if (prev.type !== 'Fraction') {
        denominator = next.denominator.clone();
    } else if (next.type !== 'Fraction') {
        denominator = prev.denominator.clone();
    } else {
        denominator = mul(prev.denominator.clone(), next.denominator.clone());
    }

    let numerator = null;
    if (prev.type !== 'Fraction') {
        if (next.numerator.type === 'Literal' && next.numerator.value === 1) {
            numerator = prev.clone();
        } else {
            numerator = mul(prev.clone(), next.numerator.clone());
        }
    } else if (next.type !== 'Fraction') {
        if (prev.numerator.type === 'Literal' && prev.numerator.value === 1) {
            numerator = next.clone();
        } else {
            numerator = mul(prev.numerator.clone(), next.clone());
        }
    } else {
        numerator = mul(prev.numerator.clone(), next.numerator.clone());
    }

    const replacement = div(numerator, denominator);

    parent.remove(prev);
    parent.remove(next);
    parent.replace(node, replacement);

    // collapse if there is only one node in the expression
    if (replacement.prev == null && replacement.next == null) {
        if (parent.parent) {
            parent.parent.replace(parent, replacement);
        }
    }
}

module.exports = {
    label: 'multiply',
    canTransform,
    doTransform
};
