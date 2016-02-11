import React, { Component } from 'react';

import Parser from '../parser';
import transforms from '../transforms';

import StaticMath from './static-math';
import MathRenderer from './math-renderer';

const parser = new Parser();

class TextLine extends Component {
    static defaultProps = {
        insertedText: {},
        selectedText: []
    };

    constructor() {
        super();

        this.state = {
            menu: null
        };
    }

    handleSelectionChange = (selections) => {
        console.log(selections);
        if (selections.length === 1) {
            const [selection] = selections;

            for (const transform of Object.values(transforms)) {
                if (transform.canTransform(selection)) {
                    console.log(transform.label);
                }
            }

            const menuStyle = {
                background: '#EEE',
                fontFamily: 'helvetica-light',

            };

            // TODO: replace these with transform objects
            const items = [
                'cancel terms',
                'evaluate',
                'rewrite subtraction'
            ];

            const sepColor = '#CCC';

            const listStyle = {
                listStyleType: 'none',
                padding: 0,
                margin: 0,
                borderBottom: `solid 1px ${sepColor}`
            };

            const itemStyle = {
                borderTop: `solid 1px ${sepColor}`,
                padding: 10
            };

            this.setState({
                menu: <div style={menuStyle}>
                    <ul style={listStyle}>
                        {items.map(item =>
                            <li key={item} style={itemStyle}>{item}</li>)
                        }
                    </ul>
                </div>
            });
        } else {
            this.setState({
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

        const lineStyle = {
            paddingTop: 15,
            paddingBottom: 15,
            backgroundColor: active ? '#FFF' : '#DDD',
            paddingLeft: 20,
            transitionProperty: 'background-color',
            transitionDuration: '0.5s',
            transitionTimingFunction: 'ease-in-out',
        };

        const { menu } = this.state;

        return <div>
            <div style={lineStyle} onClick={this.props.onClick}>
                <div style={{opacity: active ? 1.0 : 0.5, transitionProperty: 'opacity', transitionDuration: '0.5s', transitionTimingFunction: 'ease-in-out'}}>
                    {!math && textRanges.map(
                        (range, i) => {
                            let style = {...spanStyle};
                            if (range.type === 'insertion') {
                                style.textDecoration = 'underline';
                                style.color = 'orange';
                            } else if (range.type === 'selection') {
                                style.borderRadius = 4;
                                style.border = 'solid 2px';
                                style.paddingLeft = 2;
                                style.paddingRight = 2;
                                style.color = 'blue';
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
