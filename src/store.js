const { createStore } = require('redux');

const Parser = require('./parser');
const Placeholder = require('./ast/placeholder.js');
const { findNode, getLeafNodes } = require('./ast/node-utils.js');

const parser = new Parser();
const math = parser.parse('2x + 5/2 = 10');

const initialState = {
    currentLine: math,
    cursorPosition: 0,
    cursorNode: null,
};

String.prototype.splice = function(index, count, add) {
    return this.slice(0, index) + (add || "") + this.slice(index + count);
};

const reducer = (state = initialState, action) => {
    const {currentLine, cursorPosition, cursorNode} = state;
    let newCursorPosition, newCursorNode, newCurrentLine, charCount;

    switch (action.type) {
        case 'INSERT':
            newCurrentLine = currentLine.clone();
            newCursorNode = findNode(newCurrentLine, cursorNode.id);

            if (newCursorNode.type === 'Literal') {
                let value = newCursorNode.value.toString();
                value = value.splice(cursorPosition, 0, action.value);
                newCursorNode.value = parseFloat(value);
            }

            return {
                ...state,
                currentLine: newCurrentLine,
                cursorPosition: cursorPosition + 1,
                cursorNode: newCursorNode,
            };
        case 'BACKSPACE':
            newCurrentLine = currentLine.clone();
            newCursorNode = findNode(newCurrentLine, cursorNode.id);
            newCursorPosition = cursorPosition;

            if (newCursorNode.type === 'Literal') {
                let value = newCursorNode.value.toString();
                value = value.length > 0 ? value.splice(cursorPosition - 1, 1) : '';
                newCursorPosition = Math.max(cursorPosition - 1, 0);

                if (value.length === 0) {
                    const placeholder = new Placeholder();
                    newCursorNode.parent.replace(newCursorNode, placeholder);
                    newCursorNode = placeholder;
                    newCursorPosition = 0;
                }

                newCursorNode.value = parseFloat(value);
            }

            return {
                ...state,
                currentLine: newCurrentLine,
                cursorPosition: newCursorPosition,
                cursorNode: newCursorNode,
            };
        case 'CURSOR_LEFT':
            newCursorPosition = cursorPosition - 1;
            newCursorNode = cursorNode;

            charCount = 0;
            if (cursorNode.type === 'Identifier') {
                charCount = cursorNode.name.length;
            } else if (cursorNode.type === 'Literal') {
                charCount = cursorNode.value.toString().length;
            }

            if (newCursorPosition < 0) {
                const leafNodes = getLeafNodes(currentLine);
                const index = leafNodes.findIndex(node => node.id === cursorNode.id);
                if (index > 0) {
                    newCursorNode = leafNodes[index - 1];

                    if (newCursorNode.type === 'Identifier') {
                        charCount = newCursorNode.name.length;
                    } else if (newCursorNode.type === 'Literal') {
                        charCount = newCursorNode.value.toString().length;
                    }

                    newCursorPosition = charCount;
                } else {
                    newCursorPosition = 0;
                }
            }

            return {
                ...state,
                cursorPosition: newCursorPosition,
                cursorNode: newCursorNode,
            };
        case 'CURSOR_RIGHT':
            newCursorPosition = cursorPosition + 1;
            newCursorNode = cursorNode;

            charCount = 0;
            if (cursorNode.type === 'Identifier') {
                charCount = cursorNode.name.length;
            } else if (cursorNode.type === 'Literal') {
                charCount = cursorNode.value.toString().length;
            }

            if (newCursorPosition > charCount) {
                const leafNodes = getLeafNodes(currentLine);
                const index = leafNodes.findIndex(node => node.id === cursorNode.id);
                if (index < leafNodes.length - 1) {
                    newCursorNode = leafNodes[index + 1];
                    newCursorPosition = 0;
                } else {
                    newCursorPosition = charCount;
                }
            }

            return {
                ...state,
                cursorPosition: newCursorPosition,
                cursorNode: newCursorNode,
            };
        case 'UPDATE_CURSOR':
            return {
                ...state,
                cursorNode: action.node,
            };
        default:
            return state;
    }
};

module.exports = createStore(reducer);
