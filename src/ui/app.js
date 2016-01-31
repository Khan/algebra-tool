import React, { Component } from 'react';
import { connect } from 'react-redux';

import Keypad from './keypad';
import StaticMath from './static-math';

class App extends Component {
    render() {
        const keypadStyle = {
            bottom: 0,
            left: 0
        };

        const width = window.innerWidth;
        const fontSize = 30;
        const height = 160;
        const math = this.props.currentLine;

        const style = {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
        };

        return <div style={style}>
            <div style={{ overflow: 'scroll' }}>
                <StaticMath
                    active={false}
                    fontSize={fontSize}
                    math={math}
                    width={width}
                    height={height}
                />
                <StaticMath
                    active={false}
                    fontSize={fontSize}
                    math={math}
                    width={width}
                    height={height}
                />
                <StaticMath
                    active={true}
                    fontSize={fontSize}
                    math={math}
                    width={width}
                    height={height}
                />
            </div>
            <div style={keypadStyle}>
                <Keypad />
            </div>
        </div>;
    }
}

module.exports = connect(state => state)(App);
