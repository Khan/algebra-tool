import React, { Component } from 'react';
import { connect } from 'react-redux';

import Keypad from './keypad';
import StaticMath from './static-math';
import MathRenderer from './math-renderer';

class App extends Component {
    render() {
        const width = window.innerWidth;
        const fontSize = 30;
        const height = 80;
        const math = this.props.currentLine;

        const style = {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
        };

        const keypadStyle = {
            flexGrow: 0,
            flexShrink: 1
        };

        const containerStyle = {
            flexGrow: 1,
            overflow: 'scroll'
        };

        const typing = location.search.includes('typing');

        // TODO: develop a more robust way of getting the scrollTop
        return <div style={style}>
            <div style={containerStyle}>
                {typing && <StaticMath
                    fontSize={fontSize}
                    math={math}
                    width={width}
                    height={height}
                />}
                {typing && <StaticMath
                    fontSize={fontSize}
                    math={math}
                    width={width}
                    height={height}
                />}
                {typing && <StaticMath
                    active={true}
                    fontSize={fontSize}
                    math={math}
                    width={width}
                    height={height}
                />}
                {!typing && <MathRenderer
                    ref='renderer'
                    color={'black'}
                    fontSize={fontSize}
                    width={width}
                    height={height}
                    math={math}
                />}
            </div>
            <div style={keypadStyle}>
                <Keypad />
            </div>
        </div>;
    }
}

module.exports = connect(state => state)(App);
