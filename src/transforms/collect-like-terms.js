const f = require('functify');

const { Literal, Operator, Product } = require('../ast.js');
const { mul } = require('../operations.js');
const { compare } = require('../ast/node-utils.js');

const nodeIs = type => node => node.type === type;
const nodeIsNot = type => node => node.type !== type;

const getFactors = function(node) {
    if (node.type === 'Product') {
        // TODO: need to take operators into account so that we can handle x - 3x
        const factors = f(node.children).filter(nodeIsNot('Operator'));
        if (factors.every(nodeIsNot('Literal'))) {
            return [new Literal(1), ...factors];
        } else {
            return [...factors];
        }
    } else if (node.type === 'Identifier') {
        return [new Literal(1), node];
    } else {
        return [node];
    }
};

// TODO: handle x + (-x)
function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    let selection = selections[0];

    if (selection.length === 1 && ['Expression'].includes(selection.first.type)) {
        selection = selection.first.children;
    }
    if (selection.length === 3) {
        const [a, , b] = selection;

        const aFactors = getFactors(a);
        const bFactors = getFactors(b);

        // make sure that we have a numeric coefficient
        if ([aFactors[0], bFactors[0]].every(nodeIs('Literal'))) {
            // create products from all non-numeric factors
            // we clone the factors when creating these new products because we
            // don't want to affect the AST at this point
            const aProduct = aFactors
                .filter(nodeIsNot('Literal'))
                .reduce((product, factor) => mul(product, factor.clone()), new Literal(1));
            const bProduct = bFactors
                .filter(nodeIsNot('Literal'))
                .reduce((product, factor) => mul(product, factor.clone()), new Literal(1));

            // if the product is a simply a Literal it means that there were no
            // non literal factors to multiply one by which means there's
            // nothing for us to factor
            if (aProduct.type === 'Literal' || bProduct.type === 'Literal') {
                return false;
            }

            // verify that they match
            // we don't use deepEqual here because we want to allow x*y and y*x
            // to be considered the same
            // TODO: make this configurable with an option to usee deepEqual instead
            return compare(aProduct, bProduct);
        }
    }
    return false;
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    let selection = selections[0];

    if (selection.length === 1 && ['Expression'].includes(selection.first.type)) {
        selection = selection.first.children;
    }
    const [a, operator, b] = selection;
    const parent = operator.parent;

    const aFactors = getFactors(a);
    const bFactors = getFactors(b);

    const coeff = new Literal(0);

    aFactors.filter(nodeIs('Literal')).forEach(factor => coeff.value = parseFloat(coeff.value) + parseFloat(factor.value));
    bFactors.filter(nodeIs('Literal')).forEach(factor => coeff.value = parseFloat(coeff.value) + parseFloat(factor.value));

    const replacement = aFactors.filter(nodeIsNot('Literal')).reduce((product, factor) => mul(product, factor.clone()), coeff);

    parent.remove(a);
    parent.remove(b);
    parent.replace(operator, replacement);

    // collapse if there is only one node in the expression
    if (replacement.prev == null && replacement.next == null) {
        if (parent.parent) {
            parent.parent.replace(parent, replacement);
        }
    }
}

// passing test cases
// x + x
// 2x + x
// x + 2x
// 2x + 2x
// xy + xy
// 2xy + xy
// xy + 2xy
// 2xy + 2xy
// x - x => 0x ?
// 2x - x
// x - 2x
// x + (-2)x
// x - (-2)x
// etc.
// it might be easier to fuzz this
// also test subtraction
// rejecting test cases
// 0 + 0*1
// failing test cases:
// x - x => 0x - right now equals 2x

module.exports = {
    label: 'collect like terms',
    canTransform,
    doTransform
};
