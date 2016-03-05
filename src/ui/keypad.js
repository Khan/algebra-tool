import React, { Component } from 'react';

import Button from './button';
import store from './../store';

class Keypad extends Component {
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
            type: 'PERFORM_OPERATION',
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

    handleUndo = () => {
        store.dispatch({
            type: 'UNDO',
        });
    };

    handleRedo = () => {
        store.dispatch({
            type: 'REDO',
        });
    };

    render() {
        const width = this.props.width;
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
            bgActive: "#666",
            text: "white",
            fontSize: 18,
        };

        return <div style={{marginTop:1, flexShrink:0, cursor: 'default'}}>
            <div style={rowStyle}>
                <Button {...topRowColor} onTap={this.handleUndo}><i className="fa fa-undo"/></Button>
                <Button {...topRowColor} onTap={this.handleRedo}><i className="fa fa-repeat"/></Button>
                <Button {...topRowColor} disabled onTap={this.handleLeft}><i className="fa fa-arrow-left"/></Button>
                <Button {...topRowColor} disabled onTap={this.handleRight}><i className="fa fa-arrow-right"/></Button>
                <Button {...topRowColor} onTap={this.handleEnter}><i className="fa fa-check"/></Button>
                <Button {...topRowColor} onTap={this.handleBackspace}><i className="fa fa-backward"/></Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors} disabled>(</Button>
                <Button {...emptyColors} disabled>)</Button>
                <Button {...numStyle} onTap={this.handleNumber}>7</Button>
                <Button {...numStyle} onTap={this.handleNumber}>8</Button>
                <Button {...numStyle} onTap={this.handleNumber}>9</Button>
                <Button {...opColors} onTap={() => this.handleOperator('+')}>+</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors} disabled>&radic;</Button>
                <Button {...emptyColors} disabled>^</Button>
                <Button {...numStyle} onTap={this.handleNumber}>4</Button>
                <Button {...numStyle} onTap={this.handleNumber}>5</Button>
                <Button {...numStyle} onTap={this.handleNumber}>6</Button>
                <Button {...opColors} onTap={() => this.handleOperator('-')}>–</Button>
            </div>
            <div style={rowStyle}>
                <Button {...emptyColors} disabled>&pi;</Button>
                <Button {...emptyColors} disabled>e</Button>
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
                <Button {...emptyColors} disabled>=</Button>
                <Button {...opColors} onTap={() => this.handleOperator('/')}>÷</Button>
            </div>
        </div>;
    }
}

export { Keypad as default };
