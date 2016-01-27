let _id = 1;

function generateId() {
    return String(_id++);
}

module.exports = {
    generateId,
};
