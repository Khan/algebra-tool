
let stepId = 0;

export const addStep = (math) => {
    return {
        type: 'ADD_STEP',
        id: stepId++,
        math
    };
};

// this could be a binary operator or something else like squaring, square-rooting, calling a function
// TODO: modify this action to modify the current step
export const performOperation = (id, operation) => {
    return {
        type: 'PERFORM_OPERATION',
        operation,
        id
    };
};


