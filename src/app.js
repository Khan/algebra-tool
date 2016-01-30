const React = require('react');
const { connect } = require('react-redux');

const Keypad = require('./keypad.js');
const StaticMath = require('./static-math.js');

class App extends React.Component {
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
