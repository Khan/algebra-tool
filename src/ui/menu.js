import React, { Component } from 'react';

class MenuItem extends Component {
    handleTouchStart = e => {

    };

    handleTouchMove = e => {

    };

    handleTouchEnd = e => {
        if (this.props.onTap) {
            this.props.onTap(this.props.item);
        }
    };

    render() {
        const { item } = this.props;

        const sepColor = '#CCC';

        const itemStyle = {
            borderTop: `solid 1px ${sepColor}`,
            padding: 10
        };

        return <li
            style={itemStyle}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
        >
            {item}
        </li>;
    }
}

class Menu extends Component {
    handleTouchStart = e => {

    };

    handleTouchMove = e => {
        e.preventDefault();
    };

    handleTouchEnd = e => {

    };

    handleTap = item => {
        if (this.props.onTap) {
            this.props.onTap(item);
        }
    };

    render() {
        const { items } = this.props;

        const sepColor = '#CCC';

        const listStyle = {
            listStyleType: 'none',
            padding: 0,
            margin: 0,
            borderBottom: `solid 1px ${sepColor}`
        };

        const menuStyle = {
            background: '#EEE',
            fontFamily: 'helvetica',
        };

        return <div
            style={menuStyle}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
        >
            <ul style={listStyle}>
                {items.map(item =>
                    <MenuItem key={item} item={item} onTap={this.handleTap} />)}
            </ul>
        </div>;
    }
}

export { Menu as default };
