function canTransform(selection) {
    if (selection.type === 'range') {
        return false;
    }
    const node = selection.first;
    return node.type === 'Literal' && parseFloat(node.value) === 1 &&
        node.parent.type === 'Fraction' && node.parent.denominator === node;
}

function doTransform(selection) {
    if (canTransform(selection)) {
        const node = selection.first;
        const { parent } = node;

        parent.parent.replace(parent, parent.numerator);
    }
}

module.exports = {
    label: 'eliminate',
    canTransform,
    doTransform,
};
