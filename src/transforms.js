module.exports = {
    add_fractions: require('./transforms/add-fractions.js'),
    cancel_factor: require('./transforms/cancel-factor.js'),
    commute: require('./transforms/commute'),
    distribute_backwards: require('./transforms/distribute-backwards'),
    distribute_forwards: require('./transforms/distribute-forwards'),
    eliminate_div_by_one: require('./transforms/eliminate-div-by-one.js'),
    eliminate_zero: require('./transforms/eliminate-zero.js'),
    evaluate: require('./transforms/evaluate.js'),
    factor: require('./transforms/factor.js'),
    rewrite_as_subtraction: require('./transforms/rewrite-as-subtraction'),
    rewrite_subtraction: require('./transforms/rewrite-subtraction'),
    swap_sides: require('./transforms/swap-sides'),
};
