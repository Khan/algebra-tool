import { createStore } from 'redux';

import Parser from './parser';
import Placeholder from './ast/placeholder';
import { add, sub, mul, div } from './operations';
import { traverseNode } from './ast/node-utils';

const parser = new Parser();

const initialState = {
    steps: [
        {
            text: '2x+5=10',
            math: parser.parse('2x+5=10')
        },
        //{
        //    text: '2x+5=10',
        //    insertedText: {
        //        "4": "-5",
        //        "7": "-5"
        //    }
        //},
        //{
        //    text: '2x+5-5=10-5',
        //    math: parser.parse('2x+5-5=10-5'),
        //    selection: null
        //}
    ],
    activeStep: 0
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
        case 'SELECT_MATH':
            const steps = [...state.steps];
            steps.splice(state.activeStep, 1, {
                ...activeStep,
                selection: action.selection
            });

            return { ...state, steps };
        case 'SIMPLE_OPERATION':
            const equalIndex = activeStep.text.indexOf('=');
            const newMath = activeStep.math.clone();

            // TODO: reduce for tree traversal
            let maxId = 0;
            traverseNode(newMath, node => maxId = Math.max(maxId, node.id));

            if (equalIndex) {
                const op = { '+': add, '-': sub, '*': mul, '/': div }[action.operator];
                newMath.root = op(newMath.root, new Placeholder());
            }

            const newActiveStep = {
                ...activeStep,
                math: newMath,
                maxId: maxId
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
        case 'ADD_STEP':
            return {
                ...state,
                steps: [
                    ...state.steps,
                    {
                        text: '',
                        math: action.math
                    }
                ],
                activeStep: state.activeStep + 1
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
