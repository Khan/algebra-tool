# Algebra Tool

A tool for manipulating algebraic expressions and equations.

![screenshot.png](screenshot.png)

## Features

- works with equations and expressions
- basic operations: +, -, *, /
- integers and fractions
- adjust the amount help it gives the student
- undo/redo
- history with descriptions of actions
- hint system (when running the server locally)

## Future

- powers and roots
- absolute value
- trigonometry
- system of equations
- vectors and matrices
- differentiation and integration

## Installation

- `npm install`
- `npm start`
- in another terminal `node api-server.js`

## Live Demo

[khan.github.io/algebra-tool](khan.github.io/algebra-tool)

### Support URL Params

- start: URL encoded expression or equation, default: `2x + 5 = 10`
- end: URL encoded expression or equation, default: `x = 5/2`
- eliminateZero: if an `evaluate` action results in a zero, we will automatically remove it.  TODO: handle division by zero
- eliminateDivByOne: if a `cancel` operation results in division by one, we will automatically remove it.
- autoeval: compute the result of an `evaluate` action instead of asking the user to input the result.

## Contributing

Please report bugs and feature requests to https://github.com/khan/algebra-tool/issues.
