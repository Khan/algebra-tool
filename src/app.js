const React = require('react');

const Button = require('./button.js');

class App extends React.Component {
    render() {
        const rowStyle = {
            marginBottom: 5
        };
        const keypadStyle = {
            position: 'absolute',
            bottom: 0,
            left: 0
        };
        const opColors = {
            color: "#C00",
            activeColor: "#900"
        };
        const emptyColors = {
            color: "#999",
            activeColor: "#666"
        };

        return <div style={keypadStyle}>
            <div style={rowStyle}>
                <Button {...emptyColors}>...</Button>
                <Button {...emptyColors}>abc</Button>
                <Button {...emptyColors}>&#x2190;</Button>
                <Button {...emptyColors}>&#x2192;</Button>
                <Button {...emptyColors}>&#x21ba;</Button>
                <Button {...emptyColors}>&#x21bb;</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>r</Button>
                <Button {...emptyColors}>&#x2610;/&#x2610;</Button>
                <Button>7</Button>
                <Button>8</Button>
                <Button>9</Button>
                <Button {...opColors}>+</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>d</Button>
                <Button {...emptyColors}>&#x2610;^&#x2610;</Button>
                <Button>4</Button>
                <Button>5</Button>
                <Button>6</Button>
                <Button {...opColors}>–</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>x</Button>
                <Button {...emptyColors}>&#x221a;&#x2610;</Button>
                <Button>1</Button>
                <Button>2</Button>
                <Button>3</Button>
                <Button {...opColors}>·</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>y</Button>
                <Button {...emptyColors}>&pi;</Button>
                <Button>0</Button>
                <Button>.</Button>
                <Button>&#x25c0;</Button>
                <Button {...opColors}>÷</Button>
            </div>
        </div>;
    }
}

module.exports = App;
