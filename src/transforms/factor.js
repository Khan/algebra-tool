const f = require('functify');

const { Literal } = require('../ast.js');
const { mul } = require('../operations.js');
const { findCommonAncestor, deepEqual } = require('../ast/node-utils.js');


function canTransform(selections) {
    if (selections.length > 1) {
        const ancestor = findCommonAncestor(...selections.map(sel => sel.first));

        if (ancestor.type === "Expression") {
            if (selections.every(sel => sel.first.parent === ancestor || sel.first.parent.type === 'Product' && sel.first.parent.parent === ancestor)) {
                const factors = selections.map(sel => sel.toExpression());
                const [first, ...rest] = factors;
                if (rest.every(expr => deepEqual(first, expr))) {
                    return true;
                }
            }
        }
    }
    return false;
}

function doTransform(selections) {
    if (canTransform(selections)) {
        const ancestor = findCommonAncestor(...selections.map(sel => sel.first));

        selections.forEach(selection => {
            if (selection.first.parent.type === 'Product' && selection.first.parent.parent === ancestor) {
                selection.first.parent.removeSelection(selection);
            } else if (selection.first.parent === ancestor) {
                ancestor.replace(selection.toExpression(), new Literal(1));
            }
        });

        const factor = selections[0].toExpression().clone(true);
        ancestor.parent.replace(ancestor, mul(factor, ancestor));
    }
}

module.exports = {
    label: 'factor',
    canTransform,
    doTransform
};
