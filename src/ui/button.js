import React, { Component } from 'react';

class Button extends Component {
    state = {
        active: false,
        mousedown: false,
    };

    static defaultProps = {
        color: '#099',
        activeColor: '#066',
        fontSize: 22,
        width: 44,
        height: 32,
        onTap: () => {},
        text: 'white'
    };

    handleTouchStart = (e) => {
        e.preventDefault();
        if (!this.props.disabled) {
            this.setState({active: true});
        }
    };

    handleTouchEnd = () => {
        if (!this.props.disabled) {
            this.setState({active: false});
            this.props.onTap(this.props.children);
        }
    };

    handleClick = () => {
        if (!this.props.disabled) {
            this.props.onTap(this.props.children);
        }
    };

    render() {
        const {bgColor, bgActive, text, transparent, width, height, fontSize, disabled} = this.props;

        const color = this.state.active ? bgActive : bgColor;

        const style = {
            display: 'inline-block',
            fontSize: fontSize,
            width: width,
            height: height,
            backgroundColor: transparent ? 'white' : color,
            color: text,
            lineHeight: `${height}px`,
            textAlign: 'center',
            marginLeft: 1,
            fontFamily: disabled ? 'helvetica' : 'helvetica-light',
        };

        return <div
            style={style}
            onTouchStart={this.handleTouchStart}
            onTouchEnd={this.handleTouchEnd}
            onClick={this.handleClick}
        >
            <div style={{opacity:disabled ? 0.25 : 1.0}}>
                {this.props.children}
            </div>
        </div>;
    }
}

export { Button as default };
