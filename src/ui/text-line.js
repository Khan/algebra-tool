import React, { Component } from 'react';

class TextLine extends Component {
    render() {
        const { text, insertedText } = this.props;

        const spanStyle = {
            fontSize: 26,
            fontFamily: 'helvetica-light',
        };

        const textRanges = [];

        let start = 0;
        for (let end of Object.keys(insertedText)) {
            textRanges.push({
                text: text.substring(start, end),
                color: 'black',
            });
            textRanges.push({
                text: insertedText[end],
                color: 'blue',
            });
            start = end;
        }

        textRanges.push({
            text: text.substring(start, text.length),
            color: 'black'
        });

        const lineStyle = {
            marginTop: 20
        };

        return <div style={lineStyle}>
            {textRanges.map(
                range => {
                    let style = {...spanStyle, color: range.color};
                    if (range.color !== 'black') {
                        style.textDecoration = 'underline';
                    }
                    return <span style={style}>{range.text}</span>;
                }
            )}
        </div>;
    }
}

export { TextLine as default };
