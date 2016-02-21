import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Keypad from './keypad';
import Step from './step';
import MathRenderer from './math-renderer';
import store from './../store';


class AuxApp extends Component {
    static propTypes = {
        goal: PropTypes.any.isRequired,
        steps: PropTypes.arrayOf(PropTypes.any).isRequired,
        activeStep: PropTypes.any.isRequired,
    };

    select = i => {
        store.dispatch({
            type: 'SELECT_STEP',
            step: i
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
            flexDirection: 'column'
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

        return <div style={style}>
            <div style={containerStyle} ref="container">
                <div style={{height:180,flexShrink:0}}></div>
                {this.props.steps.map((step, i, steps) => {
                    const active = step.active || i > 0 && steps[i - 1].active;
                    return <Step
                        {...step}
                        onClick={() => this.select(i)}
                        key={i}
                        active={active}
                    />;
                    })
                }
                {<Step
                    {...this.props.activeStep}
                    onClick={() => this.select(-1)}
                    active={true}
                    key="activeStep"
                />}
                <div style={{height:180,flexShrink:0}}></div>
            </div>
            {goal}
            <Keypad width={this.props.width}/>
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
