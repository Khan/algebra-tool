const React = require('react');
const { connect } = require('react-redux');

const Keypad = require('./keypad.js');
const Display = require('./display.js');
const Parser = require('./parser.js');
const StaticMath = require('./static-math.js');

const parser = new Parser();

class App extends React.Component {
    render() {
        const keypadStyle = {
            position: 'absolute',
            bottom: 0,
            left: 0
        };

        const math1 = parser.parse('2x+5=10');
        const math2 = parser.parse('2x+5-5=10-5');
        const math3 = parser.parse('2x+5-5=5');
        const math4 = parser.parse('2x+0=5');
        const width = window.innerWidth;

        const fontSize = 30;
        const height = 60;

        return <div>
            <Display {...this.props} />
            <StaticMath fontSize={fontSize} math={math1} width={width} height={height} />
            <StaticMath fontSize={fontSize} math={math2} width={width} height={height} />
            <StaticMath fontSize={fontSize} math={math3} width={width} height={height} />
            <StaticMath fontSize={fontSize} math={math4} width={width} height={height} />
            <div style={keypadStyle}>
                <Keypad />
            </div>
        </div>;
    }
}

module.exports = connect(state => state)(App);
