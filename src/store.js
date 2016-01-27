const { createStore } = require('redux');
const Parser = require('./parser');

const parser = new Parser();

const math = parser.parse('2x + 5 = 10');

const initialState = {
    currentLine: math,
    cursorPosition: math.length
};

const reducer = (state = initialState, action) => {
    const {currentLine, cursorPosition} = state;

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
            return {
                ...state,
                cursorPosition: Math.max(cursorPosition - 1, 0)
            };
        case 'CURSOR_RIGHT':
            return {
                ...state,
                cursorPosition: Math.min(cursorPosition + 1, currentLine.length)
            };
        default:
            return state;
    }
};

module.exports = createStore(reducer);
