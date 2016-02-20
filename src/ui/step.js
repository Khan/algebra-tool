import React, { Component } from 'react';

import MathRenderer from './math-renderer';
import Menu from './menu';
import Selection from './selection';
import { findNode } from '../ast/node-utils';
import store from './../store';
import transforms from '../transforms';


class Step extends Component {
    state = {
        menu: null
    };

    static defaultProps = {
        selections: [],
    };

    handleTap = transform => {
        const { math, selections } = this.props;
        const newMath = math.clone();

        const newSelections = selections.map(selection => {
            const first = findNode(newMath, selection.first.id);
            const last = findNode(newMath, selection.last.id);
            return new Selection(first, last);
        });

        if (transform.canTransform(newSelections)) {
            transform.doTransform(newSelections);
        }

        store.dispatch({
            type: 'ADD_STEP',
            math: newMath
        });

        this.setState({
            menu: null
        });
    };

    showMenu = () => {
        const { selections } = this.props;

        const items = Object.values(transforms).filter(
            transform => transform.canTransform(selections));

        const menu = items.length > 0 ? <Menu items={items} onTap={this.handleTap} /> : null;

        this.setState({ menu: <div style={{position: 'absolute', width:'100%'}}>{menu}</div> });
    };

    hideMenu = () => {
        this.setState({ menu: null });
    };

    render() {
        const { math, maxId, selections, active, cursor, finished } = this.props;
        const { menu } = this.state;

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

        return <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={lineStyle} onClick={this.props.onClick}>
                <div style={textStyle}>
                    <MathRenderer
                        maxId={maxId}
                        fontSize={26}
                        math={math}
                        active={active}
                        selections={selections}
                        showMenu={this.showMenu}
                        hideMenu={this.hideMenu}
                        cursor={cursor}
                    />
                </div>
            </div>
            {active && menu}
            {finished && <div
                    style={{
                        position: 'absolute',
                        width:'100%',
                        borderLeft: 'solid 20px #444',
                        borderRight: 'solid 20px #444',
                        boxSizing: 'border-box',
                        paddingTop: 15,
                        paddingBottom: 15,
                        fontFamily: 'helvetica-light',
                        fontSize: 26,
                        backgroundColor: '#444',
                        color: '#FFF'
                    }}
                >
                    You got it!
                    <button
                        style={{
                            position: 'absolute',
                            right: 0,
                            fontSize: 22,
                            backgroundColor: '#BBB',
                            border: 'none',
                            borderRadius: 4,
                        }}
                    >next</button>
                </div>
            }
        </div>;
    }
}

export { Step as default };
