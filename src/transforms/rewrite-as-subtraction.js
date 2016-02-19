import Literal from '../ast/literal';
import Operator from '../ast/operator';

const isNegative = function(node) {
    if (node.type === 'Literal' && node.value < 0) {
        return true;
    } else if (node.type === 'Negation') {
        return true;
    } else if (node.type === 'Product') {
        return isNegative(node.first);
    }
};

const negate = function(node) {
    const parent = node.parent;
    if (node.type === 'Literal' && node.value < 0) {
        parent.replace(node, new Literal(-node.value));
    } else if (node.type === 'Negation') {
        parent.replace(node, node.value);
    } else if (node.type === 'Product') {
        negate(node.first);
    }
};

function canTransform(selections) {
    if (selections.length !== 1) return false;

    let selection = selections[0];
    // TODO: do we need to do this for 'Product'?
    if (['Expression', 'Product'].includes(selection.first.type) && selection.length === 1) {
        selection = selection.first.children;
    }
    if (selection.length === 3) {
        const [ , operator, last] = selection;
        return operator.operator === '+' && isNegative(last);
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
        const parent = last.parent;

        negate(last);
        parent.replace(operator, new Operator('-'));
    }
}

module.exports = {
    label: 'change to subtraction',
    canTransform,
    doTransform
};
