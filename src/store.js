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
        active: true,
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
                    activeStep: {
                        ...activeStep,
                        active: true,
                    },
                };
            }
            return {
                ...state,
                activeStep: {
                    ...activeStep,
                    active: false,
                },
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
                        math: activeStep.math.clone(),
                        action: {
                            type: 'INSERT',
                            operation: action.operator,
                            value: null
                        }
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
            let value = null;
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    // TODO: try/catch and provide feedback if math isn't valid
                    value = parser.parse(node.text).root;
                    node.parent.replace(node, value);
                }
            });

            const lastStep = state.steps[state.steps.length - 1];
            const previousSteps = state.steps.slice(0, state.steps.length - 1);

            return {
                ...state,
                steps: [
                    ...previousSteps,
                    {
                        ...lastStep,
                        action: {
                            ...lastStep.action,
                            value: value.clone()
                        }
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
                        // TODO: store the selections and the transform used
                        // selections: activeStep.selections,
                        selections: [],
                        math: activeStep.math.clone(),
                        action: {
                            type: 'TRANSFORM',
                            transform: action.transform,
                        }
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
