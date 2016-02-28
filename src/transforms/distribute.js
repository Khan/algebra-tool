import { mul } from '../operations';

function canTransform(selections) {
    if (selections.length !== 1) return false;

    let selection = selections[0];
    if (selection.length === 1 && selection.first.type === 'Product') {
        selection = selection.first.children;
    }

    if (selection.length !== 3) {
        return;
    }

    const [left, operator, right] = selection;

    return left.parent.type === 'Product' && operator.operator === '*' &&
        (right.type === 'Expression' || left.type === 'Expression');
}

function doTransform(selections) {
    if (!canTransform(selections)) {
        return;
    }

    let selection = selections[0];
    if (selection.length === 1 && selection.first.type === 'Product') {
        selection = selection.first.children;
    }

    const [left, operator, right] = selection;

    const terms = [];
    if (right.type === 'Expression') {
        for (const child of right.children) {
            if (child.type !== 'Operator') {
                terms.push(child);
            }
        }

        for (const term of terms) {
            const prod = mul(left.clone(true), term.clone());
            right.replace(term, prod);
        }

        const parent = left.parent;
        parent.remove(left);
        parent.remove(operator);

        // TODO: check if the result epxression is the only factor in the parent product
        // parent.parent.replace(parent, right);
        console.log(parent.parent.type);

        if (parent.children.length === 1) {
            parent.parent.replace(parent, right);
        }
    } else {
        for (const child of left.children) {
            if (child.type !== 'Operator') {
                terms.push(child);
            }
        }

        for (const term of terms) {
            const prod = mul(term.clone(), right.clone(true));
            left.replace(term, prod);
        }

        const parent = left.parent;
        parent.remove(right);
        parent.remove(operator);

        // TODO: check if the tree can be collapsed
        // parent.parent.replace(parent, left);

        if (parent.children.length === 1) {
            parent.parent.replace(parent, left);
        }
    }
}

// TEST CASES
// 2*(x+1+y)*3  - forwards and backwards
// 2*(x+1) - check that there's no parens
// (x+1)*2 - check that there's no parens
// (x+y)*(a+b)
// (x-y)*(a-b)

module.exports = {
    label: 'distribute',
    canTransform,
    doTransform
};
