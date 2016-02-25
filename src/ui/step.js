import React, { Component } from 'react';

import MathRenderer from './math-renderer';
import Menu from './menu';
import Selection from './selection';
import { findNode } from '../ast/node-utils';
import store from './../store';
import transforms from '../transforms';


class Step extends Component {
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

        store.dispatch({
            type: 'HIDE_MENU'
        });

        if (transform.needsUserInput) {
            store.dispatch({
                type: 'GET_USER_INPUT',
                transform: transform,
                selections: selections,
            });
        } else {
            if (transform.canTransform(newSelections)) {
                transform.doTransform(newSelections);
            }

            store.dispatch({
                type: 'ADD_STEP',
                math: newMath,
                transform: transform,
            });
        }
    };

    handleClick = e => {
        // TODO: pass down the number of the step as a prop so we don't need to
        // ask app.js to dispatch a 'SELECT_STEP' action
        if (this.props.onClick) {
            this.props.onClick();
        }

        // deselect all math in the current step if we click somewhere that
        // contains no math
        store.dispatch({
            type: 'SELECT_MATH',
            selections: []
        });
    };

    createMenu = () => {
        const { selections } = this.props;

        const items = Object.values(transforms).filter(
            transform => transform.canTransform(selections));

        const menu = items.length > 0 ? <Menu items={items} onTap={this.handleTap} /> : null;

        return <div style={{position: 'absolute', width:'100%'}}>{menu}</div>;
    };

    showMenu = () => {
        store.dispatch({
            type: 'SHOW_MENU'
        });
    };

    hideMenu = () => {
        store.dispatch({
            type: 'HIDE_MENU'
        });
    };

    render() {
        const { math, maxId, selections, active, cursor, userInput, current, menuVisible } = this.props;

        const menu = menuVisible ? this.createMenu() : null;

        const animate = false;
        const transitionStyle = animate ? {
            transitionProperty: 'background-color',
            transitionDuration: '0.5s',
            transitionTimingFunction: 'ease-in-out'
        } : null;

        const lineStyle = {
            ...transitionStyle,
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
        };

        if (active) {
            lineStyle.backgroundColor = '#FFF';
        }

        const textStyle = {
            opacity: active ? 1.0 : 0.5,
            ...transitionStyle
        };

        let input = null;

        if (userInput) {
            const inputStyle = {
                position: 'absolute',
                width:'100%',
                backgroundColor: '#444',
                border: 'solid 10px #444',
                fontFamily: 'helvetica-light',
                color: 'white',
                fontSize: 18,
                boxSizing: 'border-box',
            };

            // TODO: instead of using and <input> field, create a MathRenderer
            // with an equation with a Placeholder node on the right
            input = <div style={inputStyle}>
                <MathRenderer
                    math={userInput.math}
                    fontSize={18}
                    active={true}
                    cursor={true}
                    color={'white'}
                />
                {userInput.incorrect && <span style={{position:'absolute',right:0,top:0}}>try again</span>}
            </div>;
        }

        const hintButton = <button
            style={{
                position: 'absolute',
                right: 10,
                top: 10,
                backgroundColor: 'orange',
                fontFamily: 'helvetica-light',
                fontSize: 18,
                border: 'none',
                borderRadius: 4,
            }}
            onClick={this.props.onHintRequest}
        >hint</button>;

        return <div style={{ position: 'relative', flexShrink: 0, WebkitUserSelect: 'none' }}>
            <div style={lineStyle}>
                <div style={textStyle}>
                    <MathRenderer
                        onClick={this.handleClick}
                        maxId={maxId}
                        fontSize={26}
                        math={math}
                        active={current}
                        selections={selections}
                        showMenu={this.showMenu}
                        hideMenu={this.hideMenu}
                        cursor={cursor}
                    />
                </div>
            </div>
            {input}
            {active && menu}
        </div>;
    }
}

export { Step as default };
