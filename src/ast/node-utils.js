let _id = 1;

function generateId() {
    return String(_id++);
}

function findNode(node, id) {
    if (node.id === id) {
        return node;
    } else if (["Expression", "Product"].includes(node.type)) {
        for (const child of node) {
            const result = findNode(child, id);
            if (result) {
                return result;
            }
        }
    } else if (node.type === "Equation") {
        const lhs = findNode(node.left, id);
        if (lhs) return lhs;
        const rhs = findNode(node.right, id);
        if (rhs) return rhs;
    } else if (node.type === "Fraction") {
        const num = findNode(node.numerator, id);
        if (num) return num;
        const den = findNode(node.denominator, id);
        if (den) return den;
    } else if (node.type === "Negation") {
        const num = findNode(node.value, id);
        if (num) return num;
    } else if (node.type === "Math") {
        const num = findNode(node.root, id);
        if (num) return num;
    }
    return null;
}

function traverseNode(node, callback) {
    callback(node);
    if (["Expression", "Product"].includes(node.type)) {
        for (const child of node) {
            traverseNode(child, callback);
        }
    } else if (node.type === "Equation") {
        traverseNode(node.left, callback);
        traverseNode(node.right, callback);
    } else if (node.type === "Fraction") {
        traverseNode(node.numerator, callback);
        traverseNode(node.denominator, callback);
    } else if (node.type === "Negation") {
        traverseNode(node.value, callback);
    } else if (node.type === "Math") {
        traverseNode(node.root, callback);
    }
}

function getLeafNodes(root) {
    const leafNodes = [];
    traverseNode(root, node => {
        if (node.type === 'Literal' || node.type === 'Identifier') {
            leafNodes.push(node);
        }
    });
    return leafNodes;
}

export { generateId, findNode, getLeafNodes };
