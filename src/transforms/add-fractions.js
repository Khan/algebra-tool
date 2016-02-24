const { add, sub, div } = require('../operations.js');
const { deepEqual } = require('../ast/node-utils.js');

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    let selection = selections[0];

    if (selection.length === 1 && selection.first.type === 'Expression') {
        selection = selection.first.children;
    }
    if (selection.length === 3) {
        const [first, operator, last] = selection;
        const parent = operator.parent;

        if (first.type === 'Fraction' && last.type === 'Fraction' && parent.type === 'Expression') {
            if (selection.first.prev && selection.first.prev.operator === '-') {
                return false;
            }

            if (['+', '-'].includes(operator.operator)) {
                return deepEqual(first.denominator, last.denominator);
            }
        }
    }
    return false;
}

function getLabel(selection) {
    if (selection.length === 1 && selection.first.type === 'Expression') {
        selection = selection.first;
    }
    const [ , operator, ] = selection;
    if (operator.operator === '+') {
        return 'add fractions';
    } else if (operator.operator === '-') {
        return 'subtract fractions';
    }
}

function doTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    let selection = selections[0];

    if (selection.length === 1 && selection.first.type === 'Expression') {
        selection = selection.first.children;
    }
    const [first, operator, last] = selection;
    const parent = operator.parent;
    const op = {
        '+': add,
        '-': sub
    }[operator.operator];

    const replacement = div(
        op(first.numerator.clone(), last.numerator.clone()),
        first.denominator.clone()
    );

    parent.remove(first);
    parent.remove(last);
    parent.replace(operator, replacement);

    // collapse if there is only one node in the expression
    if (replacement.prev == null && replacement.next == null) {
        if (parent.parent) {
            parent.parent.replace(parent, replacement);
        }
    }
}

module.exports = {
    label: 'add fractions',
    canTransform,
    doTransform,
    getLabel
};
