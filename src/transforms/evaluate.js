const React = require('react');
//const Modal = require('../views/modal.js');

const Literal = require("../ast/literal.js");
const { compare } = require('../ast/node-utils.js');

const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
};

function canTransform(selection) {
    if (selection.length === 1 && ['Expression', 'Product'].includes(selection.first.type)) {
        selection = selection.first;
    }
    if (selection.length >= 3 && selection.first.type === 'Literal' && selection.last.type == 'Literal' && ['Expression', 'Product'].includes(selection.first.parent.type)) {
        if (selection.first.prev && selection.first.prev.operator === '-') {
            return false;
        }
        return true;
    }
    return false;
}

function doTransform(selection, newMath) {
    if (canTransform(selection)) {
        if (selection.length === 1 && ['Expression', 'Product'].includes(selection.first.type)) {
            selection = selection.first;
        }
        const [first, ...rest] = selection;
        const parent = first.parent;
        rest.forEach(node => parent.remove(node));

        //const replacement = newMath;
        // TODO: re-enable automatic evaluation of single operations
        const replacement = first.clone();
        for (let i = 0; i < rest.length; i += 2) {
            const operator = rest[i].operator;
            const operand = rest[i + 1].value;
            replacement.value = operations[operator](replacement.value, operand);
        }

        parent.replace(first, replacement);

        // collapse if there is only one node in the expression
        if (replacement.prev == null && replacement.next == null) {
            if (parent.parent) {
                parent.parent.replace(parent, replacement);
            }
        }
    }
}

function getModal(selections, callback) {
    const mathToReplace = selections[0].toExpression();

    //return <Modal
    //    math={mathToReplace}
    //    callback={callback}
    //    validateInput={compare}
    ///>;
}

module.exports = {
    label: 'evaluate',
    canTransform,
    doTransform,
    needsUserInput: false,
    getModal
};
