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
            textAlign: 'center',
            fontFamily: 'Helvetica-Light',
            fontSize: 30,
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
            </div>
            <NewKeypad />
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
