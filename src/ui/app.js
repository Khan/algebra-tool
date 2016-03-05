import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Keypad from './keypad';
import Step from './step';
import MathRenderer from './math-renderer';
import store from '../store';
import actions from '../actions/index';
import deserialize from '../ast/deserialize';
import Selection from './selection';
import { findNode, superTraverseNode } from '../ast/node-utils';
import params from '../params';


var getPath = function(root, selection) {
    var path = [];
    var firstPath = null;
    var lastPath = null;

    superTraverseNode(
        root,
        (node, parent, property, index) => {    // enter
            path.push({ property, index });
            if (selection.first.id === node.id) {
                firstPath = [...path];
            }
            if (selection.last.id === node.id) {
                lastPath = [...path];
            }
        },
        (node, parent, property, index) => {    // leave
            path.pop();
        }
    );

    return { firstPath, lastPath };
};


var navigateToPath = function(root, path) {
    if (path.length === 0) {
        return root;
    } else {
        const pathComponent = path.shift();
        if (pathComponent.property === 'children') {
            return navigateToPath(root.children.at(pathComponent.index), path);
        } else {
            return navigateToPath(root[pathComponent.property], path);
        }
    }
};

class App extends Component {
    static propTypes = {
        goal: PropTypes.any.isRequired,
        steps: PropTypes.arrayOf(PropTypes.any).isRequired,
        currentIndex: PropTypes.number.isRequired,
        activeIndex: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showHints: false
        };
    };

    select = i => {
        store.dispatch({
            type: 'SELECT_STEP',
            index: i
        });
    };

    doHintCall = (i, success, error) => {
        console.log('requesting hint from server');

        const { steps, currentIndex } = this.props;

        $.ajax({
            url: 'http://localhost:3000/api/next_step_for',
            method: 'GET',
            data: {
                question: JSON.stringify(steps[0].math),
                currentStep: JSON.stringify(steps[i].math),
                steps: steps.slice(0, currentIndex + 1).map(step => JSON.stringify(step.math)),
            },
        }).then(success, error);
    };

    handleHintRequest = i => {
        console.log('requesting hint from server');

        const { steps, currentIndex } = this.props;

        const success = res => {
            const currentStep = steps[currentIndex];

            const {action, backup, math} = JSON.parse(res);

            if (backup > 0) {
                alert(`backup ${backup} steps and 'take a hint' again`);
                return;
            }

            // console.log('ACTION');
            // console.log(action);
            // console.log('MATH');
            // console.log(math);

            // TODO: handle selections where the ids don't match
            // this requires find the path of each node in each selection
            if (action.type === 'TRANSFORM') {
                const selections = action.selections.map(selection => {
                    const expr = deserialize(JSON.parse(selection));
                    if (['Expression', 'Product'].includes(expr.type)) {
                        return new Selection(expr.first, expr.last);
                    } else {
                        return new Selection(expr);
                    }
                });


                const newSelections = selections.map(selection => {
                    const path = getPath(JSON.parse(math), selection);
                    // console.log("PATH");
                    // console.log(path);

                    const first = navigateToPath(currentStep.math, path.firstPath);
                    const last = navigateToPath(currentStep.math, path.lastPath);

                    // console.log('first = ');
                    // console.log(first);
                    // console.log('last = ');
                    // console.log(last);

                    return new Selection(first, last);
                });

                // console.log('next_step_for:');
                // console.log(action);
                //
                // console.log('currentStep:');
                // console.log(currentStep);
                //
                // console.log('selections:');
                // console.log(selections);
                //
                // console.log('newSelections:');
                // console.log(newSelections);

                store.dispatch({
                    type: 'SELECT_MATH',
                    selections: newSelections,
                });
            } else if (action.type === 'PERFORM_OPERATION') {
                const operation = action.operation;
                const value = JSON.parse(action.value);

                if (value.type === "Literal") {
                    store.dispatch(actions.performOperation(operation, value.value));
                } else if (value.type === "Identifier") {
                    throw new Error("we don't handle hints with variables yet");
                } else {
                    throw new Error(`we don't handle hints with ${value.type} operands yet`);
                }
            }

            store.dispatch({
                type: 'SHOW_MENU',
            });
        };

        const error = (xhr, err) => {
            const res = JSON.parse(xhr.responseText);
            console.log(res);
            alert(res.message);
        };

        this.doHintCall(i, success, error);
    };

    enableHints() {
        this.setState({showHints: params.hints});
    };

    handleNextProblem = e => {
        location.reload();
    };

    componentWillMount() {
        const { currentIndex } = this.props;
        this.doHintCall(currentIndex, this.enableHints.bind(this));
    };

    componentDidMount() {
        const {offsetHeight, scrollHeight} = this.refs.container;

        if (scrollHeight > offsetHeight) {
            this.refs.container.scrollTop = scrollHeight - offsetHeight;
        }
    };

    handleNumber = number => {
        store.dispatch({
            type: 'INSERT_CHAR',
            char: number
        });
    };

    handleOperation = operation => {
        const { steps, currentIndex } = this.props;
        const currentStep = steps[currentIndex];

        if (currentStep.userInput || currentStep.cursor) {
            store.dispatch({
                type: 'INSERT_CHAR',
                char: operation,
            });
        } else {
            store.dispatch(actions.performOperation(operation));
        }
    };

    render() {
        const { steps, currentIndex, activeIndex, finished, selections } = this.props;
        const currentStep = steps[currentIndex];
        const previousSteps = steps.slice(0, currentIndex);

        const style = {
            display: 'flex',
            flexDirection: 'column',
            height: this.props.height,
            width: this.props.width,
            backgroundColor: 'white',
            position: 'relative',
        };

        const containerStyle = {
            flexGrow: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
            background: '#EEE',
            display: 'flex',
            // use column-reverse so that the current step is always first so
            // it doesn't change position
            flexDirection: 'column-reverse'
        };

        const lineStyle = {
            fontFamily: 'Helvetica-Light',
            fontSize: 26,
        };

        const goalStyle = {
            ...lineStyle,
            display: 'flex',
            flexDirection: 'row',
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 5,
            marginBottom: 5,
            flexShrink: 0,
            fontSize: 20,
        };

        const goal = <div style={goalStyle}>
            <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>Goal:</div>
            <div style={{ margin: 'auto' }}>
                <MathRenderer
                    fontSize={20}
                    math={this.props.goal}
                />
            </div>
        </div>;

        const history = [];
        const expandHistory = params.expandHistory;

        previousSteps.forEach((step, i, steps) => {
            const previousActive = i - 1 === activeIndex;
            const active = activeIndex === i || previousActive;
            const maxId = previousActive && i > 0 && steps[i - 1].action && steps[i - 1].action.maxId || Infinity;
            const selections = activeIndex === i && step.action && step.action.selections || [];

            history.push(<Step
                {...step}
                onClick={() => this.select(i)}
                key={i}
                maxId={maxId}
                active={expandHistory ? finished : active}
                selections={selections}
            />);

            const style = {
                backgroundColor: '#999',
                color: 'white',
                fontFamily: 'helvetica-light',
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 15,
                paddingBottom: 15,
                flexShrink: 0,

            };

            if (expandHistory ? finished : (i === activeIndex && step.action)) {
                // TODO: handle nodes other than Literals
                if (step.action.value) {
                    const value = step.action.value.value;
                    const message = {
                        '+': `Add ${value} to both sides`,
                        '-': `Subtract ${value} from both sides`,
                        '*': `Multiply both sides by ${value}`,
                        '/': `Divide both sides by ${value}`,
                    }[step.action.operation];

                    history.push(<div key={`action-${i}`} style={style}>
                        <i className="fa fa-arrow-down"/> {message}
                    </div>);
                } else if (step.action.transform) {
                    const message = step.action.transform.label;
                    history.push(<div key={`action-${i}`} style={style}>
                        <i className="fa fa-arrow-down"/> {message}
                    </div>);
                }
            }
        });

        // reverse the history so it appears in the correct order since
        // flex-direction is column-reverse
        history.reverse();

        const maxId = activeIndex == previousSteps.length - 1 && steps[activeIndex].action && steps[activeIndex].action.maxId || Infinity;

        // console.log(currentStep.math.toJSON());

        const hintButton = <button
            style={{
                position: 'absolute',
                right: 10,
                top: 10,
                backgroundColor: 'orange',
                fontFamily: 'helvetica-light',
                fontSize: 18,
                border: 'none',
                borderRadius: 4,
                paddingLeft: 8,
                paddingRight: 8,
            }}
            onClick={() => this.handleHintRequest(currentIndex)}
        >take a hint</button>;

        return <div style={style} onMouseDown={e => e.preventDefault()}>
            <div style={containerStyle} ref="container">
                <div style={{height:180,flexShrink:0}}></div>
                {<Step
                    {...currentStep}
                    selections={selections}
                    onClick={() => this.select(currentIndex)}
                    active={activeIndex >= previousSteps.length - 1}
                    current={activeIndex === currentIndex && !currentStep.userInput}
                    maxId={activeIndex === currentIndex ? currentStep.maxId : maxId}
                    key="currentStep"
                    finished={finished}
                />}
                {history}
                <div style={{height:180,flexShrink:0}}></div>
            </div>
            {false && goal}
            {this.state.showHints && !finished && currentIndex == activeIndex && hintButton}
            {finished && <div
                style={{
                        position: 'absolute',
                        width:'100%',
                        bottom: 166,
                        borderLeft: 'solid 20px #444',
                        borderRight: 'solid 20px #444',
                        boxSizing: 'border-box',
                        paddingTop: 15,
                        paddingBottom: 15,
                        fontFamily: 'helvetica-light',
                        fontSize: 26,
                        backgroundColor: '#444',
                        color: '#FFF'
                    }}
            >
                You made it, yay!
                <button
                    style={{
                            position: 'absolute',
                            right: 0,
                            fontSize: 22,
                            backgroundColor: '#2F0',
                            color: '#444',
                            border: 'none',
                            borderRadius: 4,
                            paddingLeft: 8,
                            paddingRight: 8,
                        }}
                    onClick={this.handleNextProblem}
                >next</button>
            </div>
            }
            <Keypad
                width={this.props.width}
                onNumber={this.handleNumber}
                onOperation={this.handleOperation}
            />
        </div>;
    };
}

module.exports = connect(state => state)(App);
