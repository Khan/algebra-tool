import React, { Component } from 'react';

export default class Button extends Component {
    constructor(props) {
        super(props);

        this.state = {
            active: false
        }
    }

    static defaultProps = {
        color: '#099',
        activeColor: '#066',
        width: 44,
        onTap: () => {}
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
        const {bgColor, bgActive, transparent, width} = this.props;

        const color = this.state.active ? bgActive : bgColor;

        const style = {
            fontSize: 22,
            display: 'inline-block',
            width: width,
            height: 32,
            backgroundColor: transparent ? 'white' : color,
            color: transparent ? color : 'white',
            lineHeight: '32px',
            textAlign: 'center',
            borderRadius: 4,
            marginLeft: 5,
            fontFamily: 'helvetica',
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
