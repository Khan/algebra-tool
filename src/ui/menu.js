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
        const { label } = this.props;

        const sepColor = '#666';

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
            {label}
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

    render() {
        const { items } = this.props;

        const sepColor = '#666';

        const listStyle = {
            listStyleType: 'none',
            padding: 0,
            margin: 0,
            borderBottom: `solid 1px ${sepColor}`
        };

        const menuStyle = {
            background: '#444',
            fontFamily: 'helvetica-light',
            color: 'white'
        };

        return <div
            style={menuStyle}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
        >
            <ul style={listStyle}>
                {items.map(item =>
                    <MenuItem
                        key={item.label}
                        label={item.label}
                        onTap={() => this.props.onTap(item)}
                    />)
                }
            </ul>
        </div>;
    }
}

export { Menu as default };
