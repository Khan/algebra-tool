import { createStore } from 'redux';

import Parser from './parser';
import Placeholder from './ast/placeholder';
import { add, sub, mul, div } from './operations';
import { traverseNode, deepEqual } from './ast/node-utils';
import params from './params';

const parser = new Parser();

const initialState = {
    steps: [],
    currentStep: {
        math: params.start ? parser.parse(params.start) : parser.parse('2x+5=10'),
        active: true,
    },
    goal: params.end ? parser.parse(params.end) : parser.parse('x=5/2')
};

const reducer = (state = initialState, action) => {
    const currentStep = state.currentStep;
    const newMath = currentStep.math.clone();
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
                    currentStep: {
                        ...currentStep,
                        active: true,
                    },
                };
            }
            return {
                ...state,
                currentStep: {
                    ...currentStep,
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
                currentStep: {
                    ...currentStep,
                    selections: action.selections
                }
            };
        case 'SIMPLE_OPERATION':
            // TODO: have two modes... when we're in insertion mode any keystroke get's appended to the current insertionText
            // TODO: we need to keep track of the operation we're using during the insertion mode so we can insert parens appropriately

            // TODO: reduce for tree traversal
            traverseNode(newMath, node => maxId = Math.max(maxId, node.id));

            if (currentStep.cursor) {
                traverseNode(newMath, node => {
                    if (node.type === 'Placeholder') {
                        node.text += action.operator;
                    }
                });

                return {
                    ...state,
                    currentStep: {
                        ...currentStep,
                        math: newMath,
                        maxId: currentStep.maxId,
                        cursor: true,
                    },
                };
            }

            if (currentStep.math.root.type === 'Equation') {
                const op = { '+': add, '-': sub, '*': mul, '/': div }[action.operator];
                const placeholder = new Placeholder();
                newMath.root = op(newMath.root, placeholder);
            }

            return {
                ...state,
                currentStep: {
                    ...currentStep,
                    math: newMath,
                    maxId: maxId,
                    cursor: true,
                },
                steps: [
                    ...state.steps,
                    {
                        math: currentStep.math.clone(),
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
                        ...currentStep,
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
                currentStep: {
                    ...currentStep,
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
                currentStep: {
                    ...currentStep,
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
                            value: value.clone(),
                            maxId: currentStep.maxId,
                        },
                    },
                ],
                currentStep: {
                    ...currentStep,
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
                        selections: [],
                        math: currentStep.math.clone(),
                        action: {
                            type: 'TRANSFORM',
                            transform: action.transform,
                            selections: currentStep.selections,
                        },
                    },
                ],
                currentStep: {
                    ...currentStep,
                    math: action.math,
                    selections: [],
                }
            };
        case 'CHECK_ANSWER':
            const finished = deepEqual(state.goal, currentStep.math);

            return {
                ...state,
                currentStep: {
                    ...currentStep,
                    finished: finished
                },
            };
        case 'GET_USER_INPUT':
            console.log(action);
            const selection = action.selections[0];
            const math = parser.parse('a=b');
            const left = selection.toExpression();
            const right = new Placeholder();
            math.root.left = left;
            left.parent = math.root;
            math.root.right = right;
            right.parent = math.root;

            return {
                ...state,
                currentStep: {
                    ...currentStep,
                    userInput: {
                        transform: action.transform,
                        value: '',
                        math: math,
                    }
                },
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
