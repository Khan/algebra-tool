import React, { Component } from 'react';

import Parser from '../parser';
import StaticMath from './static-math';
import MathRenderer from './math-renderer';

const parser = new Parser();

class TextLine extends Component {
    static defaultProps = {
        insertedText: {},
        selectedText: []
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
        };

        const useStaticMath = Object.keys(insertedText).length === 0;

        return <div style={lineStyle} onClick={this.props.onClick}>
            <div style={{opacity: active ? 1.0 : 0.5}}>
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
            />}
            </div>
        </div>;
    }
}

export { TextLine as default };
