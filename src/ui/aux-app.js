import React, { Component } from 'react';
import { connect } from 'react-redux';

import NewKeypad from './new-keypad';
import Step from './step';
import MathRenderer from './math-renderer';
import auxStore from './../aux-store';
import Parser from '../parser';

const parser = new Parser();

function easeCubic(t) {
    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function easeQuadratic(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

class AuxApp extends Component {
    static defaultProps = {
        goal: parser.parse('x = 5/2')
    };

    select = step => {
        auxStore.dispatch({
            type: 'SELECT_STEP',
            step: step
        });
    };

    componentDidMount() {
        const {offsetHeight, scrollHeight} = this.refs.container;

        if (scrollHeight > offsetHeight) {
            this.refs.container.scrollTop = scrollHeight - offsetHeight;
        }
    }

    render() {
        const style = {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
        };

        const containerStyle = {
            flexGrow: 1,
            overflow: 'scroll',
            background: '#EEE',
            display: 'flex',
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
            marginTop: 10,
            marginBottom: 10,
            flexShrink: 0,
        };

        const goal = <div style={goalStyle}>
            <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>Goal:</div>
            <div style={{ margin: 'auto' }}>
                <MathRenderer
                    fontSize={26}
                    math={this.props.goal}
                />
            </div>
        </div>;

        const length = this.props.steps.length;

        return <div style={style}>
            <div style={containerStyle} ref="container">
                <div style={{height:180,flexShrink:0}}></div>
                {this.props.steps.map((line, i) =>
                    <Step
                        {...line}
                        key={i === 0 ? 0 : length - i}
                        onClick={e => this.select(i)}
                        active={this.props.activeStep === i}
                    />)
                }
                <div style={{height:180,flexShrink:0}}></div>
            </div>
            {goal}
            <NewKeypad />
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
