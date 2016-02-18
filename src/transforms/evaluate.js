const React = require('react');
//const Modal = require('../views/modal.js');

const Literal = require('../ast/literal');
const { compare } = require('../ast/node-utils');
const { generateId } = require('../ast/node');

const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
};

function canTransform(selections) {
    if (selections.length !== 1) return false;

    let selection = selections[0];
    if (selection.length === 1) {
        if (selection.first.type === 'Expression') {
            selection = selection.first.children;
        } else if (selection.first.type === 'Product') {
            selection = selection.first;
        }
    }
    if (selection.length >= 3 && selection.first.type === 'Literal' && selection.last.type == 'Literal' && ['Expression', 'Product'].includes(selection.first.parent.type)) {
        if (selection.first.prev && selection.first.prev.operator === '-') {
            return false;
        }
        return true;
    }
    return false;
}

function doTransform(selections, userInput) {
    if (canTransform(selections)) {
        if (selections.length !== 1) return false;

        let selection = selections[0];
        if (selection.length === 1) {
            if (selection.first.type === 'Expression') {
                selection = selection.first.children;
            } else if (selection.first.type === 'Product') {
                selection = selection.first;
            }
        }
        const [first, ...rest] = selection;
        const parent = first.parent;
        rest.forEach(node => parent.remove(node));

        //const replacement = newMath;
        // TODO: re-enable automatic evaluation of single operations
        const replacement = first.clone();
        for (let i = 0; i < rest.length; i += 2) {
            const operator = rest[i].operator;
            // TODO: moving parsing of the number into the operation
            const operand = parseFloat(rest[i + 1].value);
            replacement.value = operations[operator](parseFloat(replacement.value), operand);
            replacement.id = generateId();
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
