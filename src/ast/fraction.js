const {generateId} = require('./node-utils');
const Node = require('./node');

class Fraction extends Node {
    constructor(numerator, denominator) {
        super();
        this.type = 'Fraction';
        this.numerator = numerator;
        this.denominator = denominator;
        this.numerator.parent = this;
        this.denominator.parent = this;
    }

    toString() {
        return `[${this.type}:${this.numerator}/${this.denominator}]`;
    }

    clone(uniqueId = false) {
        const copy = Object.create(Fraction.prototype);
        copy.type = this.type;
        copy.id = uniqueId ? generateId() : this.id;
        copy.numerator = this.numerator.clone(uniqueId);
        copy.denominator = this.denominator.clone(uniqueId);
        copy.numerator.parent = copy;
        copy.denominator.parent = copy;
        return copy;
    }

    replace(current, replacement) {
        if (this.numerator === current) {
            this.numerator = replacement;
            replacement.parent = this;
            current.parent = null;
        } else if (this.denominator === current) {
            this.denominator = replacement;
            replacement.parent = this;
            current.parent = null;
        }
    }
}

module.exports = Fraction;
