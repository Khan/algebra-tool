import { mul } from '../operations';

function canTransform(selections) {
    if (selections.length !== 1) return false;
    if (selections[0].length !== 1) return false;

    const node = selections[0].first;
    return node.parent && node.parent.type === 'Product' &&
        node.next && node.next.operator === '*' &&
        node.next.next && node.next.next.type === 'Expression';
}

function doTransform(selections) {
    if (canTransform(selections)) {
        const node = selections[0].first;
        const expr = node.next.next;
        const terms = [];
        for (const child of expr) {
            if (child.type !== 'Operator') {
                terms.push(child);
            }
        }
        for (const term of terms) {
            const prod = mul(node.clone(true), term.clone());
            expr.replace(term, prod);
        }
        const parent = node.parent;

        parent.parent.replace(parent, expr);
    }
}

module.exports = {
    label: 'distribute forwards',
    canTransform,
    doTransform
};
