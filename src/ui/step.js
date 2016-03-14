import React, { Component } from 'react';

import MathRenderer from './math-renderer';
import Menu from './menu';
import store from './../store';
import transforms from '../transforms';
import actions from '../actions/index';


class Step extends Component {
    static defaultProps = {
        selections: [],
    };

    handleTap = transform => {
        const { selections } = this.props;

        store.dispatch({
            type: 'HIDE_MENU'
        });

        if (transform.needsUserInput) {
            store.dispatch(actions.getUserInput(selections, transform));
        } else {
            store.dispatch(actions.addStep(selections, transform));
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
        // TODO: don't deselect if this step is current
        // TODO: don't render selection if step isn't current
        store.dispatch({
            type: 'SELECT_MATH',
            selections: []
        });
    };

    createMenu = () => {
        const { selections } = this.props;

        const items = Object.values(transforms).filter(
            transform => transform.canTransform(selections));

        // sort items by priority with high priority items appearing first
        items.sort((a, b) => {
            a = a.priority !== undefined ? a.priority : 0;
            b = b.priority !== undefined ? b.priority : 0;
            if (a > b) {
                return -1;
            } else if (b > a) {
                return 1;
            } else {
                return 0;
            }
        });

        const menu = items.length > 0 ? <Menu selections={selections} items={items} onTap={this.handleTap} /> : null;

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

    cancelUserInput = () => {
        console.log('cancel user input');
        store.dispatch({
            type: 'CANCEL_USER_INPUT'
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
            lineHeight: 0,
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
                display: 'flex',
                flexDirection: 'row',
                lineHeight: 0, // prevent extra space at bottom of div
            };

            // TODO: instead of using and <input> field, create a MathRenderer
            // with an equation with a Placeholder node on the right
            input = <div style={inputStyle}>
                <span style={{flexGrow:1,alignSelf:'center'}}>
                    <MathRenderer
                        math={userInput.math}
                        fontSize={18}
                        active={true}
                        cursor={true}
                        color={'white'}
                    />
                </span>
                {userInput.incorrect && <span style={{flexShrink:0,paddingRight:10,alignSelf:'center'}}>try again</span>}
                <span style={{flexShrink:0,opacity:0.25,alignSelf:'center'}} onClick={this.cancelUserInput}><i className="fa fa-times-circle"/></span>
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
