import React, { Component } from 'react';
import { connect } from 'react-redux';

import NewKeypad from './new-keypad';
import TextLine from './text-line';

class AuxApp extends Component {
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
                {this.props.lines.map(line => <TextLine {...line}/>)}
            </div>
            <NewKeypad />
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
