export const ADD_STEP = 'ADD_STEP';
export const GET_USER_INPUT = 'GET_USER_INPUT';
export const PERFORM_OPERATION = 'PERFORM_OPERATION';

let stepId = 1;

export const addStep = (math, transform) => {
    return {
        type: ADD_STEP,
        id: stepId++,
        math,
        transform,
    };
};

export const getUserInput = (selections, transform) => {
    return {
        type: GET_USER_INPUT,
        selections,
        transform,
    };
};

// this could be a binary operator or something else like squaring, square-rooting, calling a function
// TODO: modify this action to modify the current step
export const performOperation = (operation, value = null) => {
    return {
        type: PERFORM_OPERATION,
        id: stepId++,
        operation,
        value,
    };
};

export default { addStep, getUserInput, performOperation };
