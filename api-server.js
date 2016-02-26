var restify = require('restify');

var server = restify.createServer();

// yay, middleware
server.use(restify.bodyParser());
server.use(restify.queryParser());

// stringified version of the question math is the key
// this should actually be the id of question that's a data structure containing
// textual instructions, as well as starting math, but it's hackathon so we're
// keeping this simple
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
                action: step.action,
                math: step.math
            };
        } else if (!solution.hasOwnProperty(stepKey)) {
            solution[stepKey] = {
                nextStepCount: nextStepCount,
                action: step.action,
                math: step.math
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

    var question = req.params.question.replace(/"id":"[0-9]+",/g, '');
    var currentStep = req.params.currentStep.replace(/"id":"[0-9]+",/g, '');
    var steps = req.params.steps.map(step => {
        return step.replace(/"id":"[0-9]+",/g, '');
    });

    console.log('STEPS');
    console.log(steps);

    // console.log('question');
    // console.log(question);
    // console.log('');
    //
    // console.log('currentStep');
    // console.log(currentStep);
    // console.log('');

    const solution = solutions[question];
    if (solution) {
        console.log('SOLUTION KEYS');
        console.log(Object.keys(solution));
        // console.log('');

        for (var i = steps.length - 1; i > -1; i--) {
            console.log(`STEP ${i}`);
            console.log(steps[i]);

            if (solution[steps[i]]) {
                const nextStep = solution[steps[i]];

                console.log('NEXTSTEP');
                console.log(nextStep);

                res.send(JSON.stringify({
                    action: nextStep.action,
                    backup: steps.length - 1 - i,
                    math: nextStep.math,
                }));

                return next();
            }
        }

        // this should never happen
        return next(new restify.NotFoundError("no hint found for this step"));
    } else {
        return next(new restify.NotFoundError("no hints found for this question"));
    }
});

server.listen(3001, function() {
    console.log('%s listening at %s', server.name, server.url);
});
