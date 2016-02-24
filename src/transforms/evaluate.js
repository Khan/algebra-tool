import { generateId } from '../ast/node';
import Selection from '../ui/selection';
import eliminateZero from './eliminate-zero';
import params from '../params'

const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
};

function canTransform(selections) {
    if (selections.length !== 1) return false;

    let selection = selections[0];
    if (['Expression', 'Product'].includes(selection.first.type) && selection.length === 1) {
        selection = selection.first.children;
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
        if (['Expression', 'Product'].includes(selection.first.type) && selection.length === 1) {
            selection = selection.first.children;
        }
        if (userInput) {
            console.log(userInput);
        }
        const [first, ...rest] = selection;
        const parent = first.parent;
        rest.forEach(node => parent.remove(node));

        if (userInput) {
            parent.replace(first, userInput);

            // collapse if there is only one node in the expression
            if (userInput.prev == null && userInput.next == null) {
                if (parent.parent) {
                    parent.parent.replace(parent, userInput);
                }
            }
        } else {
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

            if (params.eliminateZero) {
                const selections = [];
                selections.push(new Selection(replacement));

                if (eliminateZero.canTransform(selections)) {
                    eliminateZero.doTransform(selections);
                }
            }
        }
    }
}

module.exports = {
    label: 'evaluate',
    canTransform,
    doTransform,
    needsUserInput: !params.autoeval,
};
