function canTransform(selections) {
    if (selections.length !== 1) return false;
    if (selections[0].length > 1) return false;

    const node = selections[0].first;
    return node.type === 'Literal' && parseFloat(node.value) === 1 &&
        node.parent.type === 'Fraction' && node.parent.denominator === node;
}

function doTransform(selections) {
    if (canTransform(selections)) {
        const node = selections[0].first;
        const { parent } = node;

        parent.parent.replace(parent, parent.numerator);
    }
}

module.exports = {
    label: 'eliminate',
    canTransform,
    doTransform,
};
