import { createStore } from 'redux';

const initialState = {
    lines: [
        {
            text: '2x + 5 = 10',
            insertedText: {}
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
            insertedText: {}
        }
    ]
};

const reducer = (state = initialState, action) => {
    console.log(action);
    return state;
};

const store = createStore(reducer);

export { store as default };
