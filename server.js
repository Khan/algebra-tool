var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.dev');

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    proxy: {
        '/api/*': {
            target: 'http://localhost:3001',
            secure: false,
        },
    }
}).listen(3000, 'localhost', function (err, result) {
    if (err) {
        console.log(err);
    }
    console.log('Listening at localhost:3000');
});


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

function addSteps(steps) {
    var question = steps[0];
    if (!solutions.hasOwnProperty(question)) {
        solutions[question] = {};
    }

    var solution = solutions[question];
    for (var i = 0; i < steps.length - 1; i++) {
        var nextStepCount = steps.length - i - 1;
        var step = steps[i];
        if (solution[step] && solution[step].nextStepCount > nextStepCount) {
            solution[step] = {
                nextStepCount: nextStepCount,
                nextStep: steps[i+1]
            };
        } else if (!solution.hasOwnProperty(step)) {
            solution[step] = {
                nextStepCount: nextStepCount,
                nextStep: steps[i+1]
            };
        }
    }
}

server.post('/api/steps', (req, res, next) => {
    var steps = req.params.steps;
    console.log(steps);

    addSteps(steps);

    console.log(solutions);
    res.send(req.params);
    next();
});

server.get('/api/next_step_for', (req, res, next) => {


});

server.listen(3001, function() {
    console.log('%s listening at %s', server.name, server.url);
});
