import React, { Component } from 'react';

import Button from './button';
import store from './../store';

class NewKeypad extends Component {
    handleNumber = key => {
        store.dispatch({
            type: 'INSERT_NUMBER',
            number: key
        });
    };

    handleBackspace = () =>
        store.dispatch({
            type: 'BACKSPACE'
        });

    handleOperator = operator =>
        store.dispatch({
            type: 'SIMPLE_OPERATION',
            operator: operator
        });

    handleEnter = () =>
        store.dispatch({
            type: 'ACCEPT_STEP'
        });

    handleLeft = () => {

    };

    handleRight = () => {

    };

    render() {
        const width = window.innerWidth;
        const margin = 1;
        const buttonWidth = ((width - margin) / 6) - margin;

        const rowStyle = {
            marginBottom: margin
        };
        const buttonStyle = {
            width: buttonWidth
        };
        const numStyle = {
            ...buttonStyle,
            bgColor: "#DDD",
            bgActive: "#AAA",
            text: "black"
        };
        const opColors = {
            ...buttonStyle,
            bgColor: "#BBB",
            bgActive: "#999",
            text: "black",
        };
        const emptyColors = {
            ...buttonStyle,
            bgColor: "#BBB",
            bgActive: "#999",
            text: "black"
        };
        const topRowColor = {
            ...emptyColors,
            bgColor: "#999",
            bgActive: "#666"
            //transparent: true
        };
        //&#x232B;
        //&#x2610;/&#x2610;

        return <div style={{marginTop:1, flexShrink:0}}>
            <div style={rowStyle}>
                <Button {...topRowColor}>...</Button>
                <Button {...topRowColor}>&nbsp;</Button>
                <Button {...topRowColor} onTap={this.handleLeft}>&#x2190;</Button>
                <Button {...topRowColor} onTap={this.handleRight}>&#x2192;</Button>
                <Button {...topRowColor} onTap={this.handleEnter}>&#x21B5;</Button>
                <Button {...topRowColor} onTap={this.handleBackspace}>&#x232B;</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>(</Button>
                <Button {...emptyColors}>)</Button>
                <Button {...numStyle} onTap={this.handleNumber}>7</Button>
                <Button {...numStyle} onTap={this.handleNumber}>8</Button>
                <Button {...numStyle} onTap={this.handleNumber}>9</Button>
                <Button {...opColors} onTap={() => this.handleOperator('+')}>+</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>&#x221a;</Button>
                <Button {...emptyColors}>^</Button>
                <Button {...numStyle} onTap={this.handleNumber}>4</Button>
                <Button {...numStyle} onTap={this.handleNumber}>5</Button>
                <Button {...numStyle} onTap={this.handleNumber}>6</Button>
                <Button {...opColors} onTap={() => this.handleOperator('-')}>–</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>&pi;</Button>
                <Button {...emptyColors}>e</Button>
                <Button {...numStyle} onTap={this.handleNumber}>1</Button>
                <Button {...numStyle} onTap={this.handleNumber}>2</Button>
                <Button {...numStyle} onTap={this.handleNumber}>3</Button>
                <Button {...opColors} onTap={() => this.handleOperator('*')}>×</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors} onTap={this.handleNumber}>x</Button>
                <Button {...emptyColors} onTap={this.handleNumber}>y</Button>
                <Button {...numStyle} onTap={this.handleNumber}>0</Button>
                <Button {...numStyle} onTap={this.handleNumber}>.</Button>
                <Button {...emptyColors}>=</Button>
                <Button {...opColors} onTap={() => this.handleOperator('/')}>÷</Button>
            </div>
        </div>;
    }
}

export { NewKeypad as default };
