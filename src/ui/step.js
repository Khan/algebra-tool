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

    handleTap = item => {
        const transform = transforms[item];
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

        const items = Object.keys(transforms).filter(
            key => transforms[key].canTransform(selections));

        const menu = items.length > 0 ? <Menu items={items} onTap={this.handleTap} /> : null;

        this.setState({ menu: <div style={{position: 'absolute', width:'100%'}}>{menu}</div> });
    };

    render() {
        const { math, maxId, selections, active, cursor } = this.props;
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
                        cursor={cursor}
                    />
                </div>
            </div>
            {active && menu}
        </div>;
    }
}

export { Step as default };
