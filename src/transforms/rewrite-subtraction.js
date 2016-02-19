import Literal from '../ast/literal';
import Operator from '../ast/operator';
import Negation from '../ast/negation';

function canTransform(selections) {
    if (selections.length !== 1) return false;

    let selection = selections[0];
    // TODO: do we need to do this for 'Product'?
    if (['Expression', 'Product'].includes(selection.first.type) && selection.length === 1) {
        selection = selection.first.children;
    }
    if (selection.length === 3) {
        // can't do selection[1].operator b/c selection is an iterator
        const [ , operator, ] = selection;
        return operator.operator === '-';
    }
    return false;
}

function doTransform(selections) {
    if (canTransform(selections)) {
        let selection = selections[0];

        if (['Expression', 'Product'].includes(selection.first.type) && selection.length === 1) {
            selection = selection.first.children;
        }
        const [ , operator, last] = selection;
        const parent = operator.parent;

        if (last.type === 'Literal' && last.value > 0) {
            parent.replace(last, new Literal(-last.value));
        } else if (last.type === 'Product') {
            const firstFactor = last.first;
            if (firstFactor.type === 'Literal' && firstFactor.value > 0) {
                last.replace(firstFactor, new Literal(-firstFactor.value));
            } else {
                last.replace(firstFactor, new Negation(firstFactor));
            }
        } else {
            parent.replace(last, new Negation(last));
        }

        parent.replace(operator, new Operator('+'));
    }
}

module.exports = {
    label: 'change to addition',
    canTransform,
    doTransform
};
