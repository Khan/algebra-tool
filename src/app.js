const React = require('react');
const { connect } = require('react-redux');

const Keypad = require('./keypad.js');
const StaticMath = require('./static-math.js');

class App extends React.Component {
    render() {
        const keypadStyle = {
            position: 'absolute',
            bottom: 0,
            left: 0
        };

        const width = window.innerWidth;
        const fontSize = 30;
        const height = 60;
        const math = this.props.currentLine;

        return <div>
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
            <div style={keypadStyle}>
                <Keypad />
            </div>
        </div>;
    }
}

module.exports = connect(state => state)(App);
