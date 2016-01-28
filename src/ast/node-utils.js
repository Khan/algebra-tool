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


module.exports = {
    generateId,
    findNode,
};
