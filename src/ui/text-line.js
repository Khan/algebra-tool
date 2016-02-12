import React, { Component } from 'react';

import Parser from '../parser';
import transforms from '../transforms';

import StaticMath from './static-math';
import MathRenderer from './math-renderer';

const parser = new Parser();

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
        selectedText: []
    };

    constructor() {
        super();

        this.state = {
            menu: null,
            selection: null
        };
    }

    handleTap = item => {
        const transform = transforms[item];
        const { math } = this.props;
        const { selection } = this.state;
        //const newMath = math.clone();
        //console.log(transform.canTransform(selection));
        //transform.doTransform(selection);
        //console.log(newMath.toString());
    };

    handleSelectionChange = selections => {
        console.log(selections);
        if (selections.length === 1) {
            const [selection] = selections;

            for (const transform of Object.values(transforms)) {
                if (transform.canTransform(selection)) {
                    console.log(transform.label);
                }
            }

            const items = Object.keys(transforms).filter(key => {
                const transform = transforms[key];
                console.log(transform.canTransform(selection));
                return transform.canTransform(selection);
            });

            this.setState({
                selection: selection,
                menu: <Menu items={items} onTap={this.handleTap} />
            });
        } else {
            this.setState({
                selection: null,
                menu: null
            });
        }
    };

    render() {
        const { text, math, insertedText, selectedText, active } = this.props;

        const spanStyle = {
            fontSize: 26,
            fontFamily: 'helvetica-light',
        };

        const textRanges = [];

        let start = 0;
        for (let end of Object.keys(insertedText)) {
            textRanges.push({
                text: text.substring(start, end),
            });
            textRanges.push({
                text: insertedText[end],
                type: 'insertion'
            });
            start = end;
        }

        textRanges.push({
            text: text.substring(start, text.length),
        });

        if (textRanges.length === 1 && selectedText.length > 0) {
            textRanges.length = 0;

            let start = 0;
            for (const selection of selectedText) {
                textRanges.push({
                    text: text.substring(start, selection.start),
                });
                textRanges.push({
                    text: text.substring(selection.start, selection.end),
                    type: 'selection'
                });
                start = selection.end;
            }
            textRanges.push({
                text: text.substring(start, text.length),
            });
        }

        const animate = false;
        const transitionStyle = animate ? {
            transitionProperty: 'background-color',
            transitionDuration: '0.5s',
            transitionTimingFunction: 'ease-in-out'
        } : null;

        const lineStyle = {
            paddingTop: 15,
            paddingBottom: 15,
            backgroundColor: active ? '#FFF' : '#DDD',
            paddingLeft: 20,
            ...transitionStyle
        };

        const textStyle = {
            opacity: active ? 1.0 : 0.5,
            ...transitionStyle
        };

        const selectionStyle = {
            borderRadius: 4,
            border: 'solid 2px',
            paddingLeft: 2,
            paddingRight: 2,
            color: 'blue'
        };

        const insertionStyle = {
            textDecoration: 'underline',
            color: 'orange'
        };

        const { menu } = this.state;

        return <div>
            <div style={lineStyle} onClick={this.props.onClick}>
                <div style={textStyle}>
                    {!math && textRanges.map(
                        (range, i) => {
                            const style = {...spanStyle};
                            if (range.type === 'insertion') {
                                Object.assign(style, insertionStyle);
                            } else if (range.type === 'selection') {
                                Object.assign(style, selectionStyle);
                            }
                            const text = range.text
                                .replace(/\//g, '÷')
                                .replace(/\-/g, '–')
                                .replace(/\*/g, '·');
                            return <span style={style} key={i}>{text}</span>;
                        }
                    )}
                    {math &&
                    <MathRenderer
                        fontSize={26}
                        math={math}
                        active={active}
                        onSelectionChange={this.handleSelectionChange}
                    />}
                </div>
            </div>
            {menu}
        </div>;
    }
}

export { TextLine as default };
