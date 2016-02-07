import { createStore } from 'redux';

const initialState = {
    lines: [
        {
            text: '2x + 5 = 10',
        },
        {
            text: '2x + 5 = 10',
            insertedText: {
                "6": " - 5",
                "11": " - 5",
            }
        },
        {
            text: '2x + 5 - 5 = 10 - 5',
            selectedText: [
                {
                    start: 5,
                    end: 10
                }
            ]
        },
        {
            text: '2x + 0 = 10 - 5',
            selectedText: [
                {
                    start: 9,
                    end: 15
                }
            ]
        },
        {
            text: '2x + 0 = 5',
            selectedText: [
                {
                    start: 5,
                    end: 6
                }
            ]
        },
        {
            text: '2x = 5',
            insertedText: {
                "2": " / 2",
                "6": " / 2",
            }
        },
        {
            text: '2x / 2 = 5 / 2',
        },
        {
            text: '2x / 2 = 5 / 2',
            selectedText: [
                {
                    start: 0,
                    end: 1
                },
                {
                    start: 5,
                    end: 6
                }
            ]
        },
        {
            text: 'x = 5 / 2',
        },
    ],
    activeLine: 8,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SELECT_LINE':
            return {
                ...state,
                activeLine: action.activeLine,
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
