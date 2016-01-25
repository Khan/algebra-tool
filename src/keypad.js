const React = require('react');

const Button = require('./button.js');

class Keypad extends React.Component {
    render() {
        const width = window.innerWidth;
        const margin = 5;
        const buttonWidth = ((width - margin) / 6) - margin;

        const rowStyle = {
            marginBottom: 5
        };
        const buttonStyle = {
            width: buttonWidth
        };
        const numStyle = {
            ...buttonStyle,
            bgColor: "#099",
            bgActive: "#066"
        };
        const opColors = {
            ...buttonStyle,
            bgColor: "#C00",
            bgActive: "#900"
        };
        const emptyColors = {
            ...buttonStyle,
            bgColor: "#999",
            bgActive: "#666"
        };
        const topRowColor = {
            ...emptyColors,
            transparent: true
        };

        return <div>
            <div style={rowStyle}>
                <Button {...topRowColor}>...</Button>
                <Button {...topRowColor}>abc</Button>
                <Button {...topRowColor}>&#x2190;</Button>
                <Button {...topRowColor}>&#x2192;</Button>
                <Button {...topRowColor}>&#x21ba;</Button>
                <Button {...topRowColor}>&#x21bb;</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>r</Button>
                <Button {...emptyColors}>&#x2610;/&#x2610;</Button>
                <Button {...numStyle}>7</Button>
                <Button {...numStyle}>8</Button>
                <Button {...numStyle}>9</Button>
                <Button {...opColors}>+</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>d</Button>
                <Button {...emptyColors}>&#x2610;^&#x2610;</Button>
                <Button {...numStyle}>4</Button>
                <Button {...numStyle}>5</Button>
                <Button {...numStyle}>6</Button>
                <Button {...opColors}>–</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>x</Button>
                <Button {...emptyColors}>&#x221a;&#x2610;</Button>
                <Button {...numStyle}>1</Button>
                <Button {...numStyle}>2</Button>
                <Button {...numStyle}>3</Button>
                <Button {...opColors}>·</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>y</Button>
                <Button {...emptyColors}>&pi;</Button>
                <Button {...numStyle}>0</Button>
                <Button {...numStyle}>.</Button>
                <Button {...numStyle}>&#x25c0;</Button>
                <Button {...opColors}>÷</Button>
            </div>
        </div>;
    }
}

module.exports = Keypad;
