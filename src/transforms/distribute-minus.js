import { Negation } from '../ast';
import { removeExtraParens } from '../operations';

function canTransform(selections) {
    if (selections.length !== 1) return false;

    let selection = selections[0];
    if (selection.length === 1 && selection.first.type === 'Product') {
        selection = selection.first.children;
    }

    if (selection.length !== 2) {
        return;
    }

    const [operator, right] = selection;

    return operator.operator === '-' && right.type === 'Expression';
}

function doTransform(selections) {
    if (!canTransform(selections)) {
        return;
    }

    let selection = selections[0];
    if (selection.length === 1 && selection.first.type === 'Product') {
        selection = selection.first.children;
    }

    const [operator, right] = selection;

    if (right.type === 'Expression') {
        let negate = true;
        for (const child of right.children) {
            if (child.type === 'Operator') {
                // TODO: add an option to negate the operands instead of flip the signs
                if (child.operator === '+') {
                    child.operator = '-';
                    negate = false;
                } else if (child.operator === '-') {
                    child.operator = '+';
                    negate = true;
                }
            } else {
                if (negate) {
                    right.replace(child, new Negation(child));
                }
            }
        }

        operator.operator = '+';

        removeExtraParens(right.parent);
    }
}

// TEST CASES
// TODO: think about alternatives such as 2-(x+1) => 2+(-x)+(-1) or 2-x+(-1)
// 2-(x+1) => 2-x-1
// 2-(x-1) => 2-x-(-1)

module.exports = {
    label: 'distribute',
    canTransform,
    doTransform
};
