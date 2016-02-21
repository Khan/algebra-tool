import { createStore } from 'redux';

import Parser from './parser';
import Placeholder from './ast/placeholder';
import { add, sub, mul, div } from './operations';
import { traverseNode, deepEqual } from './ast/node-utils';
import params from './params';

const parser = new Parser();

const initialState = {
    steps: [],
    activeStep: {
        math: params.start ? parser.parse(params.start) : parser.parse('2x+5=10'),
    },
    goal: params.end ? parser.parse(params.end) : parser.parse('x=5/2')
};

const reducer = (state = initialState, action) => {
    const activeStep = state.activeStep;
    const newMath = activeStep.math.clone();
    let maxId = 0;

    switch (action.type) {
        case 'SELECT_STEP':
            if (action.step === -1) {
                return {
                    ...state,
                    steps: [
                        ...state.steps.map(step => {
                            return {
                                ...step,
                                active: false,
                            };
                        }),
                    ],
                };
            }
            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, action.step).map(step => {
                        return {
                            ...step,
                            active: false,
                        };
                    }),
                    {
                        ...state.steps[action.step],
                        active: true
                    },
                    ...state.steps.slice(action.step + 1).map(step => {
                        return {
                            ...step,
                            active: false,
                        };
                    }),
                ],
            };
        case 'SELECT_MATH':
            return {
                ...state,
                activeStep: {
                    ...activeStep,
                    selections: action.selections
                }
            };
        case 'SIMPLE_OPERATION':
            // TODO: have two modes... when we're in insertion mode any keystroke get's appended to the current insertionText
            // TODO: we need to keep track of the operation we're using during the insertion mode so we can insert parens appropriately

            // TODO: reduce for tree traversal
            traverseNode(newMath, node => maxId = Math.max(maxId, node.id));

            if (activeStep.cursor) {
                traverseNode(newMath, node => {
                    if (node.type === 'Placeholder') {
                        node.text += action.operator;
                    }
                });

                return {
                    ...state,
                    activeStep: {
                        ...activeStep,
                        math: newMath,
                        maxId: activeStep.maxId,
                        cursor: true,
                    },
                };
            }

            if (activeStep.math.root.type === 'Equation') {
                const op = { '+': add, '-': sub, '*': mul, '/': div }[action.operator];
                const placeholder = new Placeholder();
                newMath.root = op(newMath.root, placeholder);
            }

            return {
                ...state,
                activeStep: {
                    ...activeStep,
                    math: newMath,
                    maxId: maxId,
                    cursor: true,
                },
                steps: [
                    ...state.steps,
                    {
                        math: activeStep.math.clone()
                    }
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
                activeStep: {
                    ...activeStep,
                    math: newMath,
                    cusror: true,
                },
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
                activeStep: {
                    ...activeStep,
                    math: newMath,
                    cusror: true,
                },
            };
        case 'ACCEPT_STEP':
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    // TODO: try/catch and provide feedback if math isn't valid
                    const value = parser.parse(node.text).root;
                    node.parent.replace(node, value);
                }
            });


            return {
                ...state,
                steps: [
                    ...state.steps,
                    {
                        maxId: activeStep.maxId,
                        math: activeStep.math.clone(),
                    }
                ],
                activeStep: {
                    ...activeStep,
                    math: newMath,
                    maxId: Infinity,
                    cursor: false,
                },
            };
        case 'ADD_STEP':
            return {
                ...state,
                steps: [
                    ...state.steps,
                    {
                        // TODO: clone selections?
                        selections: activeStep.selections,
                        math: activeStep.math.clone(),
                    },
                ],
                activeStep: {
                    ...activeStep,
                    math: action.math,
                    selections: [],
                }
            };
        case 'CHECK_ANSWER':
            const finished = deepEqual(state.goal, activeStep.math);

            return {
                ...state,
                activeStep: {
                    ...activeStep,
                    finished: finished
                },
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
