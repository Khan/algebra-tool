const React = require('react');

const Keypad = require('./keypad.js');

class App extends React.Component {
    render() {
        const keypadStyle = {
            position: 'absolute',
            bottom: 0,
            left: 0
        };

        return <div style={keypadStyle}>
            <Keypad />
        </div>;
    }
}

module.exports = App;
