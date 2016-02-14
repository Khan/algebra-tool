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
        }
    ],
    activeStep: 0
};

console.log(initialState.steps[6]);

const reducer = (state = initialState, action) => {
    const activeStep = state.steps[state.activeStep];
    const newInsertedText = {};
    const newMath = activeStep.math.clone();
    let maxId = 0;

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
            // TODO: have two modes... when we're in insertion mode any keystroke get's appended to the current insertionText
            // TODO: we need to keep track of the operation we're using during the insertion mode so we can insert parens appropriately
            const equalIndex = activeStep.text.indexOf('=');

            // TODO: reduce for tree traversal
            traverseNode(newMath, node => maxId = Math.max(maxId, node.id));

            if (equalIndex) {
                const op = { '+': add, '-': sub, '*': mul, '/': div }[action.operator];
                const placeholder = new Placeholder();
                // TODO: remove this hack once we can edit the placeholder using the keyboard
                if (action.operator === '-') {
                    placeholder.text = '5';
                }
                if (action.operator === '/') {
                    placeholder.text = '2';
                }
                newMath.root = op(newMath.root, placeholder);
            }

            const newActiveStep = {
                ...activeStep,
                math: newMath,
                maxId: maxId
            };

            return {
                ...state,
                steps: [newActiveStep, ...state.steps]
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
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    // TODO: try/catch and provide feedback if math isn't valid
                    const value = parser.parse(node.text).root;
                    console.log(value);
                    node.parent.replace(node, value);
                }
            });

            return {
                ...state,
                steps: [
                    {
                        ...activeStep,
                        math: newMath,
                        maxId: Infinity
                    },
                    ...state.steps
                ]
            };
        case 'ADD_STEP':
            return {
                ...state,
                steps: [
                    {
                        text: '',
                        math: action.math,
                    },
                    ...state.steps,
                ]
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
