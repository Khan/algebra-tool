import React, { Component } from 'react';

import transforms from '../transforms';

import MathRenderer from './math-renderer';
import Selection from './selection';
import { findNode } from '../ast/node-utils';
import auxStore from './../aux-store';


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
        console.log(item);
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
            fontFamily: 'helvetica-light',
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

class TextLine extends Component {
    static defaultProps = {
        insertedText: {},
        selections: [],
    };

    constructor() {
        super();

        this.state = {
            menu: null,
        };
    }

    handleTap = item => {
        const transform = transforms[item];
        const { math, selections } = this.props;
        const [selection] = selections;

        if (!selection) {
            return;
        }

        const newMath = math.clone();

        // TODO: send the selection and the math AST and let the transform take care of this
        const first = findNode(newMath, selection.first.id);
        const last = findNode(newMath, selection.last.id);
        const newSelection = new Selection(first, last);

        transform.doTransform(newSelection);

        auxStore.dispatch({
            type: 'ADD_STEP',
            math: newMath
        });

        this.setState({
            menu: null
        });
    };

    showMenu = () => {
        const { selections } = this.props;

        const items = Object.keys(transforms).filter(key => {
            const transform = transforms[key];
            const [selection] = selections;
            return selection && transform.canTransform(selection);
        });

        const menu = items.length > 0 ? <Menu items={items} onTap={this.handleTap} /> : null;

        this.setState({ menu: <div style={{position: 'absolute', width:'100%'}}>{menu}</div> });
    };

    render() {
        const { math, maxId, selections, active } = this.props;
        const { menu } = this.state;

        const spanStyle = {
            fontSize: 26,
            fontFamily: 'helvetica-light',
        };

        const animate = false;
        const transitionStyle = animate ? {
            transitionProperty: 'background-color',
            transitionDuration: '0.5s',
            transitionTimingFunction: 'ease-in-out'
        } : null;

        const lineStyle = {
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            ...transitionStyle
        };

        if (active) {
            lineStyle.backgroundColor = '#FFF';
        }

        const textStyle = {
            opacity: active ? 1.0 : 0.5,
            ...transitionStyle
        };

        return <div style={{ position: 'relative' }}>
            <div style={lineStyle} onClick={this.props.onClick}>
                <div style={textStyle}>
                    <MathRenderer
                        maxId={maxId}
                        fontSize={26}
                        math={math}
                        active={active}
                        selections={selections}
                        showMenu={this.showMenu}
                    />
                </div>
            </div>
            {active && menu}
        </div>;
    }
}

export { TextLine as default };
