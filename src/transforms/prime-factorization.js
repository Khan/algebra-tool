const { Literal } = require('../ast.js');
const { mul, removeExtraProductParens } = require('../operations.js');

// TODO: move to utils
const primeFactorization = function(num, result = []) {
    let root = Math.sqrt(num);
    let x = 2;

    if (num % x) {
        x = 3;
        while ((num % x) && ((x = x + 2) < root)) { }
    }

    x = (x <= root) ? x : num;
    result.push(x);

    return (x === num) ? result : primeFactorization(num / x, result);
};

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.length !== 1) {
        return false;
    }
    const node = selection.first;
    if (node.type === 'Literal') {
        const factors = primeFactorization(node.value);
        return factors.length > 1;
    }
    return false;
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    const node = selection.first;
    const { parent } = node;
    const factors = primeFactorization(node.value);

    let product = mul(new Literal(factors[0]), new Literal(factors[1]));
    for (let i = 2; i < factors.length; i++) {
        product = mul(product, new Literal(factors[i]));
    }
    parent.replace(node, product);

    if (parent.type === 'Product') {
        removeExtraProductParens(parent);
    }
}

module.exports = {
    label: 'prime factorization',
    canTransform,
    doTransform
};
