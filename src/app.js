const React = require('react');
const { connect } = require('react-redux');

const Keypad = require('./keypad.js');
const Display = require('./display.js');

class App extends React.Component {
    render() {
        const keypadStyle = {
            position: 'absolute',
            bottom: 0,
            left: 0
        };

        return <div>
            <Display math={this.props.currentLine} />
            <div style={keypadStyle}>
                <Keypad />
            </div>
        </div>;
    }
}

module.exports = connect(state => state)(App);
