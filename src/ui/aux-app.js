import React, { Component } from 'react';

import Keypad from './keypad';

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

        return <div style={style}>
            <div style={containerStyle}>
                <div style={lineStyle}>
                    2x + 5 = 10
                </div>
            </div>
            <Keypad />
        </div>;
    }
}

export { AuxApp as default };
