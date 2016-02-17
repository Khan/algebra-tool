import { mul } from '../operations';

function canTransform(selections) {
    if (selections.length !== 1) return false;
    if (selections[0].length > 1) return false;

    const node = selections[0].first;
    return node.parent && node.parent.type === 'Product' &&
        node.prev && node.prev.operator === '*' &&
        node.prev.prev && node.prev.prev.type === 'Expression';
}

function doTransform(selections) {
    if (canTransform(selections)) {
        const node = selections[0].first;
        const expr = node.prev.prev;
        const terms = [];
        for (const child of expr) {
            if (child.type !== 'Operator') {
                terms.push(child);
            }
        }
        for (const term of terms) {
            const prod = mul(term.clone(), node.clone(true));
            expr.replace(term, prod);
        }
        const parent = node.parent;

        parent.parent.replace(parent, expr);
    }
}

module.exports = {
    label: 'distribute backwards',
    canTransform,
    doTransform
};
