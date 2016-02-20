import React, { Component } from 'react';
import { connect } from 'react-redux';

import Keypad from './keypad';
import Step from './step';
import MathRenderer from './math-renderer';
import store from './../store';
import Parser from '../parser';
import params from '../params';

const parser = new Parser();


class AuxApp extends Component {
    static defaultProps = {
        goal: params.end ? parser.parse(params.end) : parser.parse('x = 5/2')
    };

    select = step => {
        store.dispatch({
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
            height: this.props.height,
            width: this.props.width,
            backgroundColor: 'white'
        };

        const containerStyle = {
            flexGrow: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
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
            <Keypad width={this.props.width}/>
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
