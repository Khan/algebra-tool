import React, { Component } from 'react';

class Button extends Component {
    state = {
        active: false
    };

    static defaultProps = {
        color: '#099',
        activeColor: '#066',
        width: 44,
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
        const {bgColor, bgActive, text, transparent, width} = this.props;

        const color = this.state.active ? bgActive : bgColor;

        const style = {
            fontSize: 22,
            display: 'inline-block',
            width: width,
            height: 32,
            backgroundColor: transparent ? 'white' : color,
            color: text,
            lineHeight: '32px',
            textAlign: 'center',
            //borderRadius: 4,
            marginLeft: 1,
            fontFamily: 'helvetica-light',
            boxSizing: 'border-box',
            border: transparent ? '2px solid' : 'none'
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
