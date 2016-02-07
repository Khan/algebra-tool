import React, { Component } from 'react';

import Button from './button';
import auxStore from './../aux-store';

class NewKeypad extends Component {
    handleNumber = key => {
        auxStore.dispatch({
            type: 'INSERT_NUMBER',
            number: key
        });
    };

    handleBackspace = () => {
        auxStore.dispatch({
            type: 'BACKSPACE'
        })
    };

    handleOperator = operator => {
        auxStore.dispatch({
            type: 'SIMPLE_OPERATION',
            operator: operator
        });
    };

    handleLeft = () => {

    };

    handleRight = () => {

    };

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
            bgColor: "#F90",
            bgActive: "#D80"
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
        //&#x232B;
        //&#x2610;/&#x2610;

        return <div>
            <div style={rowStyle}>
                <Button {...topRowColor}>...</Button>
                <Button {...topRowColor}>&nbsp;</Button>
                <Button {...topRowColor} onTap={this.handleLeft}>&#x2190;</Button>
                <Button {...topRowColor} onTap={this.handleRight}>&#x2192;</Button>
                <Button {...topRowColor}>&nbsp;</Button>
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
                <Button {...opColors} onTap={() => this.handleOperator('*')}>·</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors}>x</Button>
                <Button {...emptyColors}>y</Button>
                <Button {...numStyle} onTap={this.handleNumber}>0</Button>
                <Button {...numStyle} onTap={this.handleNumber}>.</Button>
                <Button {...opColors}>=</Button>
                <Button {...opColors} onTap={() => this.handleOperator('/')}>÷</Button>
            </div>
        </div>;
    }
}

export { NewKeypad as default };
