const f = require('functify');

const { div } = require('../operations.js');
const { Operator, Product } = require('../ast.js');

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.length === 1 && selection.first.type === 'Fraction') {
        const { numerator, denominator } = selection.first;

        if (numerator.type === 'Product' && denominator.type === 'Product') {
            return (numerator.children.length > 1 &&
                    numerator.length === denominator.length);
        }
    }
    return false;
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    const { numerator, denominator } = selection.first;

    const product = new Product();
    for (const [num, den] of f.zip(numerator.children, denominator.children)) {
        if (num.type === 'Operator' && den.type === 'Operator') {
            product.children.append(num.clone());
        } else if (num.type !== 'Operator' && den.type !== 'Operator') {
            product.children.append(div(num.clone(), den.clone()));
        } else {
            // this should never happen
        }
    }

    selection.first.parent.replace(selection.first, product);
}

module.exports = {
    label: 'split fraction',
    canTransform,
    doTransform,
};
