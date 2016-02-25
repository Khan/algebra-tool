var restify = require('restify');

var server = restify.createServer();

// yay, middleware
server.use(restify.bodyParser());

// stringified version of the question math is the key
// this should actually be the id of question that's a data structure containing
// textual instructions, as well as starting math, but it's hackathon so we're
// keeping this simple
// TODO: create a property way to serialize and deserialize math AST objects
var solutions = {};

server.post('/api/steps', (req, res, next) => {
    var steps = req.params.steps;

    var question = steps[0].math.replace(/"id":"[0-9]+",/g, '');

    if (!solutions.hasOwnProperty(question)) {
        solutions[question] = {};
    }

    var solution = solutions[question];

    for (var i = 0; i < steps.length - 1; i++) {
        var nextStepCount = steps.length - i - 1;
        var step = steps[i];
        var stepKey = step.math.replace(/"id":"[0-9]+",/g, '');
        if (solution[stepKey] && solution[stepKey].nextStepCount > nextStepCount) {
            solution[stepKey] = {
                nextStepCount: nextStepCount,
                action: step.action
            };
        } else if (!solution.hasOwnProperty(stepKey)) {
            solution[stepKey] = {
                nextStepCount: nextStepCount,
                action: step.action
            };
        }
    }

    console.log('SOLUTIONS');
    for (var key in solution) {
        console.log(key);
        console.log(solution[key]);
        console.log('');
    }

    res.send('success');
    next();
});

server.get('/api/next_step_for', (req, res, next) => {


});

server.listen(3001, function() {
    console.log('%s listening at %s', server.name, server.url);
});
