const { createStore } = require('redux');

const Parser = require('./parser');
const { getLeafNodes } = require('./ast/node-utils.js');

const parser = new Parser();
const math = parser.parse('2x + 5/2 = 10');

const initialState = {
    currentLine: math,
    cursorPosition: 0,
    cursorNode: null,
};

const reducer = (state = initialState, action) => {
    const {currentLine, cursorPosition, cursorNode} = state;
    let newCursorPosition, newCursorNode, charCount;

    switch (action.type) {
        case 'INSERT':
            return {
                ...state,
                currentLine: currentLine.substring(0, cursorPosition) + action.value + currentLine.substring(cursorPosition),
                cursorPosition: cursorPosition + 1
            };
        case 'BACKSPACE':
            return {
                ...state,
                currentLine: currentLine.length > 0 ? currentLine.substring(0, cursorPosition - 1) + currentLine.substring(cursorPosition) : '',
                cursorPosition: Math.max(cursorPosition - 1, 0)
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
