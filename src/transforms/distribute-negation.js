import { Negation } from '../ast';

function canTransform(selections) {
    if (selections.length !== 1) return false;

    let selection = selections[0];
    return selection.length === 1 && selection.first.type === 'Negation' &&
        selection.first.value.type === 'Expression';
}

function doTransform(selections) {
    if (!canTransform(selections)) {
        return;
    }

    let selection = selections[0];

    const terms = [];
    for (const child of selection.first.value.children) {
        if (child.type !== 'Operator') {
            terms.push(child);
        }
    }

    terms.forEach(term => {
        selection.first.value.replace(term, new Negation(term.clone(true)));
    });

    const parent = selection.first.parent;

    parent.replace(selection.first, selection.first.value);
}

// TEST CASES
// -(x+1) => -x+(-1)
// -(x-1) => -x-(-1)

module.exports = {
    label: 'distribute',
    canTransform,
    doTransform
};
