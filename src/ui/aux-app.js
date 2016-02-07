import React, { Component } from 'react';
import { connect } from 'react-redux';

import NewKeypad from './new-keypad';
import TextLine from './text-line';
import auxStore from './../aux-store';

class AuxApp extends Component {
    select = step => {
        auxStore.dispatch({
            type: 'SELECT_STEP',
            step: step
        });
    };

    render() {
        const style = {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
        };

        const containerStyle = {
            flexGrow: 1,
            overflow: 'scroll',
        };

        const lineStyle = {
            fontFamily: 'Helvetica-Light',
            fontSize: 26,
        };

        const insertedText = {
            "6": " - 5",
            "11": " - 5",
        };

        return <div style={style}>
            <div style={{...containerStyle, paddingLeft: 20}}>
                {this.props.steps.map((line, i) =>
                    <TextLine
                        {...line}
                        key={i}
                        onClick={() => this.select(i)}
                        active={this.props.activeStep === i}
                    />)
                }
                <div style={{height:200}}></div>
            </div>
            <div style={{...lineStyle, paddingLeft: 20, marginTop: 5, marginBottom: 5}}>
                Goal: x = 5 / 2
            </div>
            <NewKeypad />
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
