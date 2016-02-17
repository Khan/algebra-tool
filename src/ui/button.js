import React, { Component } from 'react';

class Button extends Component {
    state = {
        active: false
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
        this.setState({ active: true });
    };

    handleTouchEnd = () => {
        this.setState({ active: false });
        this.props.onTap(this.props.children);
    };

    render() {
        const {bgColor, bgActive, text, transparent, width, height, fontSize} = this.props;

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
            fontFamily: 'helvetica-light'
        };

        return <div
            style={style}
            onTouchStart={this.handleTouchStart}
            onTouchEnd={this.handleTouchEnd}
        >
            {this.props.children}
        </div>;
    }
}

export { Button as default };
