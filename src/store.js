import { createStore } from 'redux';

import Parser from './parser';
import Placeholder from './ast/placeholder';
import { add, sub, mul, div } from './operations';
import { traverseNode, deepEqual, findNode, compare } from './ast/node-utils';
import params from './params';
import Selection from './ui/selection';

const parser = new Parser();

const initialState = {
    steps: [{
        math: params.start ? parser.parse(params.start) : parser.parse('2x+5=10'),
    }],
    currentIndex: 0,
    activeIndex: 0,
    goal: params.end ? parser.parse(params.end) : parser.parse('x=5/2')
};

const reducer = (state = initialState, action) => {
    const currentStep = state.steps[state.currentIndex];
    const newMath = currentStep.userInput ? currentStep.userInput.math.clone() : currentStep.math.clone();
    const lastStep = state.steps[state.steps.length - 1];
    const previousSteps = state.steps.slice(0, state.currentIndex);
    let maxId = 0;

    switch (action.type) {
        case 'SELECT_STEP':
            return {
                ...state,
                activeIndex: action.index,
            };
        case 'SELECT_MATH':
            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, state.currentIndex),
                    {
                        ...currentStep,
                        selections: action.selections,
                    },
                    ...state.steps.slice(state.currentIndex + 1)
                ],
            };
        case 'PERFORM_OPERATION':
            // TODO: we need to keep track of the operation we're using during the insertion mode so we can insert parens appropriately

            // TODO: reduce for tree traversal
            traverseNode(newMath, node => maxId = Math.max(maxId, node.id));

            if (currentStep.math.root.type === 'Equation') {
                const op = {
                    '+': add,
                    '-': sub,
                    '*': mul,
                    '/': div
                }[action.operator];
                const placeholder = new Placeholder();
                newMath.root = op(newMath.root, placeholder);

                if (action.value) {
                    traverseNode(newMath, node => {
                        if (node.type === 'Placeholder') {
                            node.text += action.value;
                        }
                    });
                }
            }

            return {
                ...state,
                currentIndex: state.currentIndex + 1,
                activeIndex: state.activeIndex + 1,
                steps: [
                    ...state.steps.slice(0, state.currentIndex + 1),
                    {
                        math: newMath,
                        maxId: maxId,
                        action: {
                            type: 'INSERT',
                            operation: action.operator,
                            value: null
                        },
                    },
                ],
            };
        case 'SHOW_CURSOR':
            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, state.currentIndex),
                    {
                        ...currentStep,
                        cursor: true,
                    },
                    ...state.steps.slice(state.currentIndex + 1)
                ]
            };
        case 'INSERT_CHAR':
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    node.text += action.char;
                }
            });

            if (currentStep.userInput) {
                return {
                    ...state,
                    steps: [
                        ...state.steps.slice(0, state.currentIndex),
                        {
                            ...currentStep,
                            userInput: {
                                ...currentStep.userInput,
                                math: newMath,
                                incorrect: false,
                            },
                        },
                        ...state.steps.slice(state.currentIndex + 1)
                    ],
                };
            } else if (currentStep.cursor) {
                return {
                    ...state,
                    steps: [
                        ...state.steps.slice(0, state.currentIndex),
                        {
                            ...currentStep,
                            math: newMath,
                        },
                        ...state.steps.slice(state.currentIndex + 1)
                    ],
                };
            } else {
                return state;
            }
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

            if (currentStep.userInput) {
                return {
                    ...state,
                    steps: [
                        ...state.steps.slice(0, state.currentIndex),
                        {
                            ...currentStep,
                            userInput: {
                                ...currentStep.userInput,
                                math: newMath,
                                incorrect: false,
                            },
                        },
                        ...state.steps.slice(state.currentIndex + 1)
                    ],
                };
            } else {
                return {
                    ...state,
                    steps: [
                        ...state.steps.slice(0, state.currentIndex),
                        {
                            ...currentStep,
                            math: newMath,
                        },
                        ...state.steps.slice(state.currentIndex + 1)
                    ],
                };
            }
        case 'ACCEPT_STEP':
            let value = null;
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    // TODO: try/catch and provide feedback if math isn't valid
                    value = parser.parse(node.text).root;
                    node.parent.replace(node, value);
                }
            });

            if (currentStep.userInput) {
                const selections = currentStep.selections;
                const {transform} = currentStep.userInput;

                const newNewMath = currentStep.math.clone();

                const newSelections = selections.map(selection => {
                    const first = findNode(newNewMath, selection.first.id);
                    const last = findNode(newNewMath, selection.last.id);
                    return new Selection(first, last);
                });

                if (compare(newMath.root.left, newMath.root.right)) {
                    if (transform.canTransform(newSelections)) {
                        transform.doTransform(newSelections, newMath.root.right.clone());
                    }

                    return {
                        ...state,
                        steps: [
                            ...previousSteps,
                            {
                                selections: [],
                                math: currentStep.math.clone(),
                                action: {
                                    type: 'TRANSFORM',
                                    transform: transform,
                                    selections: selections,
                                },
                            },
                            {
                                math: newNewMath,
                                selections: [],
                                active: true,
                            },
                        ],
                        activeIndex: state.activeIndex + 1,
                        currentIndex: state.currentIndex + 1,
                    };
                } else {
                    return {
                        ...state,
                        steps: [
                            ...state.steps.slice(0, state.currentIndex),
                            {
                                ...currentStep,
                                userInput: {
                                    ...currentStep.userInput,
                                    incorrect: true,
                                },
                            },
                            ...state.steps.slice(state.currentIndex + 1)
                        ],
                    };
                }
            } else {
                return {
                    ...state,
                    steps: [
                        ...previousSteps.slice(0, previousSteps.length - 1),
                        {
                            ...previousSteps[previousSteps.length - 1],
                            action: {
                                ...lastStep.action,
                                value: value.clone(),
                                maxId: currentStep.maxId,
                            },
                        },
                        {
                            ...currentStep,
                            math: newMath,
                            cursor: null,
                            maxId: Infinity,
                        },
                    ],
                };
            }
        case 'ADD_STEP':
            return {
                ...state,
                steps: [
                    ...previousSteps,
                    {
                        math: currentStep.math.clone(),
                        action: {
                            type: 'TRANSFORM',
                            transform: action.transform,
                            selections: currentStep.selections,
                        },
                    },
                    {
                        math: action.math,
                    },
                ],
                activeIndex: state.activeIndex + 1,
                currentIndex: state.currentIndex + 1,
            };
        case 'CHECK_ANSWER':
            const finished = deepEqual(state.goal, currentStep.math);

            const jsonifyAction = function(action) {
                if (action) {
                    const json = { type: action.type };

                    if (json.type === 'TRANSFORM') {
                        json.transform = action.transform.label;
                        json.selections = action.selections.map(
                            selection => JSON.stringify(selection.toExpression()));
                    } else if (json.type === 'INSERT') {
                        json.operation = action.operation;
                        json.value = JSON.stringify(action.value);
                    }

                    return json;
                } else {
                    return null;
                }
            };

            if (params.hints && finished) {
                $.ajax({
                    url: 'http://localhost:3000/api/steps',
                    method: 'post',
                    data: {
                        steps: state.steps.map(step => {
                            return {
                                math: JSON.stringify(step.math),
                                action: jsonifyAction(step.action)
                            }
                        })
                    }
                }).then(res => {
                    console.log(res);
                });
            }

            return {
                ...state,
                finished: finished,
            };
        case 'GET_USER_INPUT':
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
                steps: [
                    ...state.steps.slice(0, state.currentIndex),
                    {
                        ...currentStep,
                        userInput: {
                            transform: action.transform,
                            value: '',
                            math: math,
                        },
                    },
                    ...state.steps.slice(state.currentIndex + 1)
                ],
            };
        case 'UNDO':
            return {
                ...state,
                currentIndex: Math.max(0, state.currentIndex - 1),
                activeIndex: Math.max(0, state.currentIndex - 1),
            };
        case 'REDO':
            return {
                ...state,
                currentIndex: Math.min(state.currentIndex + 1, state.steps.length - 1),
                activeIndex: Math.min(state.currentIndex + 1, state.steps.length - 1),
            };
        case 'SHOW_MENU':
            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, state.currentIndex),
                    {
                        ...currentStep,
                        menuVisible: true,
                    },
                    ...state.steps.slice(state.currentIndex + 1)
                ],
            };
        case 'HIDE_MENU':
            return {
                ...state,
                steps: [
                    ...state.steps.slice(0, state.currentIndex),
                    {
                        ...currentStep,
                        menuVisible: false,
                    },
                    ...state.steps.slice(state.currentIndex + 1)
                ],
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
