const React = require('react');

function canTransform(selections) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.length === 1) {
        if (selection.first.type === 'Literal') {
            return true;
        } else if (selection.first.type === 'Fraction') {
            const { numerator, denominator } = selection.first;
            if (numerator.type === 'Literal' && denominator.type === 'Literal') {
                return true;
            }
        }
    }
    return false;
}

function doTransform(selections, newMath) {
    if (selections.length !== 1) {
        return false;
    }
    const selection = selections[0];

    if (selection.length === 1) {
        const node = selection.first;

        node.parent.replace(node, newMath);
    }
}

module.exports = {
    label: 'replace',
    canTransform,
    doTransform,
    needsUserInput: true
};
