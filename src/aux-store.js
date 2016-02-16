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

const reducer = (state = initialState, action) => {
    const activeStep = state.steps[state.activeStep];
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
                selections: action.selections,
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
                newMath.root = op(newMath.root, placeholder);
            }

            return {
                ...state,
                steps: [
                    {
                        ...activeStep,
                        math: newMath,
                        maxId: maxId,
                    },
                    ...state.steps
                ]
            };
        case 'SHOW_CURSOR':
            return {
                ...state,
                steps: [
                    {
                        ...activeStep,
                        cursor: true,
                    },
                    ...state.steps.slice(1)
                ]
            };
        case 'INSERT_NUMBER':
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    node.text += action.number;
                }
            });

            return {
                ...state,
                steps: [
                    {
                        ...activeStep,
                        math: newMath,
                        cusror: true,
                    },
                    ...state.steps.slice(1)
                ]
            };
        case 'BACKSPACE':
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    if (node.text === '') {
                        // TODO: think about how to undo the operation
                    } else {
                        node.text = node.text.slice(0, node.text.length - 1);
                    }
                }
            });

            return {
                ...state,
                steps: [
                    {
                        ...activeStep,
                        math: newMath,
                        cusror: true,
                    },
                    ...state.steps.slice(1)
                ]
            };
        case 'ACCEPT_STEP':
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    // TODO: try/catch and provide feedback if math isn't valid
                    const value = parser.parse(node.text).root;
                    node.parent.replace(node, value);
                }
            });

            // TODO: only the active step can have a cursor
            return {
                ...state,
                steps: [
                    {
                        ...activeStep,
                        math: newMath,
                        maxId: Infinity,
                        cursor: false,
                    },
                    ...state.steps.map(step => {
                        return {
                            ...step,
                            cursor: false
                        }
                    })
                ]
            };
        case 'ADD_STEP':
            const steps2 = [
                {
                    text: '',
                    math: action.math,
                },
                ...state.steps,
            ];
            return { ...state, steps: steps2 };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
