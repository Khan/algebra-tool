function canTransform(selections) {
    if (selections.length !== 1) return false;
    if (selections[0].length !== 1) return false;

    const node = selections[0].first;
    return node.type === 'Equation';
}

function doTransform(selections) {
    if (canTransform(selections)) {
        const node = selections[0].first;
        const { left, right } = node;
        node.left = right;
        node.right = left;
    }
}

module.exports = {
    label: 'swap sides',
    canTransform,
    doTransform
};
