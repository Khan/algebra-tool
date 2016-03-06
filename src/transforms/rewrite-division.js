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

    const removeOnes = false;

    if (node.denominator.type === 'Fraction') {
        if (removeOnes && node.numerator.type === 'Literal' && parseFloat(node.numerator.value) === 1) {
            if (removeOnes && node.denominator.numerator.type === 'Literal' && parseFloat(node.denominator.numerator.value) === 1) {
                parent.replace(
                    node,
                    node.denominator.denominator.clone()
                );
            } else {
                parent.replace(
                    node,
                    div(node.denominator.denominator.clone(), node.denominator.numerator.clone())
                );
            }
        } else {
            if (removeOnes && node.denominator.numerator.type === 'Literal' && parseFloat(node.denominator.numerator.value) === 1) {
                parent.replace(
                    node,
                    mul(
                        node.numerator.clone(),
                        node.denominator.denominator.clone()
                    )
                );
            } else {
                parent.replace(
                    node,
                    mul(
                        node.numerator.clone(),
                        div(node.denominator.denominator.clone(), node.denominator.numerator.clone())
                    )
                );
            }
        }
    } else {
        if (removeOnes && node.numerator.type === 'Literal' && parseFloat(node.numerator.value) === 1) {
            parent.replace(
                node,
                div(new Literal(1), node.denominator.clone())
            );
        } else {
            parent.replace(
                node,
                mul(
                    node.numerator.clone(),
                    div(new Literal(1), node.denominator.clone())
                )
            );
        }
    }

    if (parent.type === 'Product') {
        removeExtraProductParens(parent);
    }
}

module.exports = {
    label: 'change to multiplication',
    canTransform,
    doTransform
};
