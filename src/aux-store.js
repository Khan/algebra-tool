import { createStore } from 'redux';

import Parser from './parser';

const parser = new Parser();

const initialState = {
    steps: [
        {
            text: '2x+5=10',
            math: parser.parse('2x+5=10')
        },
        {
            text: '2x+5=10',
            insertedText: {
                "4": "-5",
                "7": "-5"
            }
        },
        {
            text: '2x+5-5=10-5',
            math: parser.parse('2x+5-5=10-5'),
            selectedText: [
                {
                    start: 3,
                    end: 6
                }
            ]
        },
        {
            text: '2x+0=10-5',
            math: parser.parse('2x+0=10-5'),
            selectedText: [
                {
                    start: 5,
                    end: 9
                }
            ]
        },
        {
            text: '2x+0=5',
            math: parser.parse('2x+0=5'),
            selectedText: [
                {
                    start: 3,
                    end: 4
                }
            ]
        },
        {
            text: '2x=5',
            insertedText: {
                "2": "/2",
                "4": "/2",
            }
        },
        {
            text: '(2x)/2=5/2',
            math: parser.parse('(2x)/2=5/2'),
            selectedText: [
                {
                    start: 0,
                    end: 1
                },
                {
                    start: 3,
                    end: 4
                }
            ],
            selectedNodeIds: [ 49, 53 ]
        },
        {
            text: 'x=5/2',
            math: parser.parse('x=5/2')
        },
    ],
    activeStep: 7,
};

console.log(initialState.steps[6]);

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
                    [equalIndex]: action.operator,
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
        case 'ACCEPT_STEP':
            const step = state.steps[state.activeStep];

            let text = "";

            let start = 0;
            for (let end of Object.keys(step.insertedText)) {
                text += step.text.substring(start, end);
                text += step.insertedText[end];
                start = end;
            }

            text += step.text.substring(start, step.text.length);

            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, state.activeStep + 1),
                    { text }
                ],
                activeStep: state.activeStep + 1
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
