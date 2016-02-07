import { createStore } from 'redux';

const initialState = {
    steps: [
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
    activeStep: 8,
};

const reducer = (state = initialState, action) => {
    const activeStep = state.steps[state.activeStep];
    const newInsertedText = {};

    switch (action.type) {
        case 'SELECT_STEP':
            return {
                ...state,
                activeStep: action.step,
            };
        case 'SIMPLE_OPERATION':
            const equalIndex = activeStep.text.indexOf('=');
            const newActiveStep = {
                ...activeStep,
                insertedText: {
                    [equalIndex - 1]: action.operator,
                    [activeStep.text.length]: action.operator
                }
            };

            return {
                ...state,
                steps: [...state.steps.slice(0, state.activeStep), newActiveStep, ...state.steps.slice(state.activeStep + 1)]
            };
        case 'INSERT_NUMBER':
            for (const [k, v] of Object.entries(activeStep.insertedText)) {
                newInsertedText[k] = v + action.number;
            }

            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, state.activeStep),
                    {
                        ...activeStep,
                        insertedText: newInsertedText
                    },
                    ...state.steps.slice(state.activeStep + 1)]
            };
        case 'BACKSPACE':
            for (const [k, v] of Object.entries(activeStep.insertedText)) {
                newInsertedText[k] = v.slice(0, v.length - 1);
            }

            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, state.activeStep),
                    {
                        ...activeStep,
                        insertedText: newInsertedText
                    },
                    ...state.steps.slice(state.activeStep + 1)]
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
