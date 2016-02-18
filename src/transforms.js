module.exports = {
    evaluate: require('./transforms/evaluate.js'),
    eliminate_zero: require('./transforms/eliminate-zero.js'),
    cancel_factor: require('./transforms/cancel-factor.js'),
    eliminate_div_by_one: require('./transforms/eliminate-div-by-one.js'),
    rewrite_subtraction: require('./transforms/rewrite-subtraction'),
    rewrite_as_subtraction: require('./transforms/rewrite-as-subtraction'),
    distribute_forwards: require('./transforms/distribute-forwards'),
    distribute_backwards: require('./transforms/distribute-backwards'),
    swap_sides: require('./transforms/swap-sides'),
    commute: require('./transforms/commute')
};
