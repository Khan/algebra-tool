import { createStore } from 'redux';

import { ADD_STEP, GET_USER_INPUT, PERFORM_OPERATION, addStep } from './actions/index';
import Parser from './parser';
import Placeholder from './ast/placeholder';
import { add, sub, mul, div } from './operations';
import { traverseNode, deepEqual, findNode, compare } from './ast/node-utils';
import params from './params';
import Selection from './ui/selection';

const parser = new Parser();

let stepId = 0;

const generateId = function() {
    return stepId++;
};

const initialState = {
    steps: [{
        id: generateId(),
        math: params.start ? parser.parse(params.start) : parser.parse('2x+5=10'),
    }],
    currentIndex: 0,
    activeIndex: 0,
    goal: params.end ? parser.parse(params.end) : parser.parse('x=5/2'),
    selections: [],
};

const updateCurrentStep = function(state, updatedStep) {
    return {
        ...state,
        steps: state.steps.map(step => {
            if (step.id === updatedStep.id) {
                return updatedStep;
            } else {
                return step;
            }
        }),
    };
};

const jsonifyAction = function(action) {
    if (action) {
        const json = { type: action.type };

        if (json.type === 'TRANSFORM') {
            json.transform = action.transform.label;
            json.selections = action.selections.map(
                selection => JSON.stringify(selection.toExpression()));
        } else if (json.type === PERFORM_OPERATION) {
            json.operation = action.operation;
            json.value = JSON.stringify(action.value);
        }

        return json;
    } else {
        return null;
    }
};

const reducer = (state = initialState, action) => {
    const currentStep = state.steps[state.currentIndex];
    const newMath = currentStep.userInput ? currentStep.userInput.math.clone() : currentStep.math.clone();
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
                selections: action.selections,
            };
        case PERFORM_OPERATION:
            // TODO: we need to keep track of the operation we're using during the insertion mode so we can insert parens appropriately

            // TODO: reduce for tree traversal
            traverseNode(newMath, node => maxId = Math.max(maxId, node.id));

            if (currentStep.math.root.type === 'Equation') {
                const op = {
                    '+': add,
                    '-': sub,
                    '*': mul,
                    '/': div
                }[action.operation];
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
                steps: [
                    ...state.steps.slice(0, state.currentIndex + 1),
                    {
                        id: action.id,
                        math: newMath,
                        maxId: maxId,
                        action: {
                            type: PERFORM_OPERATION,
                            operation: action.operation,
                            value: null,
                        },
                    },
                ],
                currentIndex: state.currentIndex + 1,
                activeIndex: state.activeIndex + 1,
            };
        case 'SHOW_CURSOR':
            return updateCurrentStep(state, {
                ...currentStep,
                cursor: true,
            });
        case 'INSERT_CHAR':
            traverseNode(newMath, node => {
                if (node.type === 'Placeholder') {
                    node.text += action.char;
                }
            });

            if (currentStep.userInput) {
                return updateCurrentStep(state, {
                    ...currentStep,
                    userInput: {
                        ...currentStep.userInput,
                        math: newMath,
                        incorrect: false,
                    },
                });
            } else if (currentStep.cursor) {
                return updateCurrentStep(state, {
                    ...currentStep,
                    math: newMath,
                });
            } else {
                return state;
            }
        case 'BACKSPACE':
            // TODO: abstract out similarities between BACKSPACE and INSERT_CHAR
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
                return updateCurrentStep(state, {
                    ...currentStep,
                    userInput: {
                        ...currentStep.userInput,
                        math: newMath,
                        incorrect: false,
                    },
                });
            } else if (currentStep.cursor) {
                return updateCurrentStep(state, {
                    ...currentStep,
                    math: newMath,
                });
            } else {
                return state;
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
                const selections = state.selections;
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
                                id: currentStep.id,
                                math: currentStep.math.clone(),
                                action: {
                                    type: 'TRANSFORM',
                                    transform: transform,
                                    selections: selections,
                                },
                            },
                            {
                                id: generateId(),
                                math: newNewMath,
                            },
                        ],
                        selections: [],
                        activeIndex: state.activeIndex + 1,
                        currentIndex: state.currentIndex + 1,
                    };
                } else {
                    return updateCurrentStep(state, {
                        ...currentStep,
                        userInput: {
                            ...currentStep.userInput,
                            incorrect: true,
                        },
                    });
                }
            } else {
                return {
                    ...state,
                    steps: [
                        ...previousSteps.slice(0, previousSteps.length - 1),
                        {
                            ...previousSteps[previousSteps.length - 1],
                            action: {
                                ...currentStep.action,
                                value: value.clone(),
                                maxId: currentStep.maxId,
                            },
                        },
                        {
                            id: currentStep.id,
                            math: newMath,
                        },
                    ],
                    // we don't actually create a new step here, yet...
                    // activeIndex: state.activeIndex + 1,
                    // currentIndex: state.currentIndex + 1,
                };
            }
        case ADD_STEP:
            const { selections, transform } = action;
            const newSelections = selections.map(selection => {
                const first = findNode(newMath, selection.first.id);
                const last = findNode(newMath, selection.last.id);
                return new Selection(first, last);
            });

            if (transform.canTransform(newSelections)) {
                transform.doTransform(newSelections);
            }

            return {
                ...state,
                steps: [
                    ...previousSteps,
                    {
                        id: currentStep.id,
                        math: currentStep.math.clone(),
                        action: {
                            type: 'TRANSFORM',
                            transform: action.transform,
                            selections: currentStep.selections,
                        },
                    },
                    {
                        id: generateId(),
                        math: newMath,
                    },
                ],
                activeIndex: state.activeIndex + 1,
                currentIndex: state.currentIndex + 1,
            };
        case 'CHECK_ANSWER':
            const finished = deepEqual(state.goal, currentStep.math);

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
        case GET_USER_INPUT:
            const selection = action.selections[0];
            const math = parser.parse('a=b');
            const left = selection.toExpression();
            const right = new Placeholder();
            math.root.left = left;
            left.parent = math.root;
            math.root.right = right;
            right.parent = math.root;

            return updateCurrentStep(state, {
                ...currentStep,
                userInput: {
                    transform: action.transform,
                    value: '',
                    math: math,
                },
            });
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
            return updateCurrentStep(state, {
                ...currentStep,
                menuVisible: true,
            });
        case 'HIDE_MENU':
            return updateCurrentStep(state, {
                ...currentStep,
                menuVisible: false,
            });
        default:
            return state;
    }
};

const store = createStore(reducer);

export { store as default };
