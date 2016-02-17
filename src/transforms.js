module.exports = {
    evaluate: require('./transforms/evaluate.js'),
    eliminate_zero: require('./transforms/eliminate-zero.js'),
    cancel_factor: require('./transforms/cancel-factor.js'),
    eliminate_div_by_one: require('./transforms/eliminate-div-by-one.js'),
    rewrite_subtraction: require('./transforms/rewrite-subtraction'),
    rewrite_as_subtraction: require('./transforms/rewrite-as-subtraction')
};
