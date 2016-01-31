import { createStore } from 'redux';

import Parser from './parser';
import Placeholder from './ast/placeholder';
import { findNode, getLeafNodes } from './ast/node-utils';
import { add, sub, mul, div } from './operations';

const parser = new Parser();
const math = parser.parse('2x + 5/2 = 10 + (1/2)/(3/4)');

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

            if (action.operator) {
                const op = {
                    '+': add,
                    '-': sub,
                    '*': mul,
                    '/': div,
                }[action.operator];

                if (op) {
                    const result = op(cursorNode.clone(), new Placeholder());
                    newCursorNode.parent.replace(newCursorNode, result);

                    return {
                        ...state,
                        currentLine: newCurrentLine,
                        cursorPosition: 0,
                        cursorNode: cursorNode,
                    };
                } else {
                    return state;
                }
            } else if (action.value) {
                if (newCursorNode.type === 'Literal') {
                    let value = newCursorNode.value;
                    if (value.includes('.') && action.value === '.') {
                        return state;
                    }
                    newCursorNode.value = value.splice(cursorPosition, 0, action.value);
                }

                return {
                    ...state,
                    currentLine: newCurrentLine,
                    cursorPosition: cursorPosition + 1,
                    cursorNode: newCursorNode,
                };
            } else {
                return state;
            }
        case 'BACKSPACE':
            newCurrentLine = currentLine.clone();
            newCursorNode = findNode(newCurrentLine, cursorNode.id);
            newCursorPosition = cursorPosition;

            if (newCursorNode.type === 'Literal') {
                let value = newCursorNode.value;
                value = value.length > 0 ? value.splice(cursorPosition - 1, 1) : '';
                newCursorPosition = Math.max(cursorPosition - 1, 0);

                if (value.length === 0) {
                    const placeholder = new Placeholder();
                    newCursorNode.parent.replace(newCursorNode, placeholder);
                    newCursorNode = placeholder;
                    newCursorPosition = 0;
                }

                newCursorNode.value = value;
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

const store = createStore(reducer);

export { store as default };
