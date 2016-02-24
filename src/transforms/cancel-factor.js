const { Literal } = require('../ast.js');
const { compare } = require('../ast/node-utils.js');

// helper function
function replace(parent, propName, newChild) {
    delete parent[propName].parent;
    parent[propName] = newChild;
    newChild.parent = parent;
}

function canTransform(selections) {
    if (selections.length === 2) {
        const [aSel, bSel] = selections;
        let aFrac = null;
        let bFrac = null;

        const a = aSel.toExpression();
        const b = bSel.toExpression();

        // TODO: proxy .first on selection to selection.first.parent
        if (a.parent.type === 'Fraction') {
            aFrac = a.parent;
        } else if (a.parent.type === 'Product' && a.parent.parent.type === 'Fraction') {
            aFrac = a.parent.parent;
        } else {
            return false;
        }

        if (b.parent.type === 'Fraction') {
            bFrac = b.parent;
        } else if (b.parent.type === 'Product' && b.parent.parent.type === 'Fraction') {
            bFrac = b.parent.parent;
        } else {
            return false;
        }

        if (aFrac !== bFrac) {
            return false;
        }

        if ((a === aFrac.numerator || a.parent === aFrac.numerator) &&
            (b === bFrac.denominator || b.parent === bFrac.denominator)) {
            return compare(a, b);
        }

        if ((a === aFrac.denominator || a.parent === aFrac.denominator) &&
            (b === bFrac.numerator || b.parent === bFrac.numerator)) {
            return compare(a, b);
        }
    }
    return false;
}

// TODO: remove denominator if it's a 1
function doTransform(selections) {
    if (canTransform(selections)) {
        const [aSel, bSel] = selections;
        const a = aSel.toExpression();
        const b = bSel.toExpression();

        let frac = a.parent.type === 'Fraction' ? a.parent : a.parent.parent;

        if (a.parent === frac) {
            if (frac.numerator === a) {
                replace(frac, 'numerator', new Literal(1));
            } else {
                replace(frac, 'denominator', new Literal(1));
            }
        } else {
            if (a.next && !a.prev) {
                a.parent.remove(a.next);
            }
            if (a.prev) {
                a.parent.remove(a.prev);
            }
            if (aSel.length === 1) {
                a.parent.remove(a);
            } else {
                a.parent.removeSelection(a);
            }
        }

        if (b.parent === frac) {
            if (frac.numerator === b) {
                replace(frac, 'numerator', new Literal(1));
            } else {
                replace(frac, 'denominator', new Literal(1));
            }
        } else {
            if (b.next && !b.prev) {
                b.parent.remove(b.next);
            }
            if (b.prev) {
                b.parent.remove(b.prev);
            }
            if (bSel.length === 1) {
                b.parent.remove(b);
            } else {
                b.parent.removeSelection(b);
            }
        }

        if (frac.numerator.type === 'Product' && frac.numerator.children.length === 0) {
            replace(frac, 'numerator', new Literal(1));
        }

        if (frac.denominator.type === 'Product' && frac.denominator.children.length === 0) {
            replace(frac, 'denominator', new Literal(1));
        }

        if (frac.numerator.type === 'Product' && frac.numerator.children.length === 1) {
            replace(frac, 'numerator', frac.numerator.first);
        }

        if (frac.denominator.type === 'Product' && frac.denominator.children.length === 1) {
            replace(frac, 'denominator', frac.denominator.first);
        }

        if (frac.denominator.type === 'Literal' && frac.denominator.value === 1) {
            frac.parent.replace(frac, frac.numerator);
        }
    }
}

// test cases
// 2/2
// 2x/2x
// 2x/x
// x/2x
// 2xy/2xy
// 2xy/xy
// xy/2xy
// 2(x+1)/2(x+1)
// 2(x+1)/(x+1)
// (x+1)/2(x+1)

module.exports = {
    label: 'cancel',
    canTransform,
    doTransform,
};
