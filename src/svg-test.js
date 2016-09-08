import React, {Component} from 'react';

import Parser from './parser';
import { createFlatLayout } from './layout/layout.js';


const parser = new Parser();


class SvgTest extends Component {
    constructor(props) {
        super();

        const mathAST = parser.parse(props.math);

        this.state = {
            cursor: null,
            layout: createFlatLayout(mathAST, 32),
        };
    }

    renderLayout(layout, dx = 0, dy = 0) {
        const handleClick = layout.id !== undefined
            ? () => {
                console.log(`${layout.id} clicked`);
                this.setState({ cursor: layout.id });
            }
            : null;

        if (layout.type === 'layout') { // TODO(kevinb) change this to group
            return <g
                transform={`translate(${layout.x + dx}, ${layout.y + dy})`}
                onClick={handleClick}
            >
                {layout.children.map(child => this.renderLayout(child))}
            </g>
        } else if (layout.type === 'glyph') {
            // TODO: return the id and index for each of these
            return <text
                x={layout.x}
                y={layout.y}
                fontFamily="Helvetica-Light"
                fontSize={layout.font.size}
                onClick={handleClick}
            >
                {layout.text}
            </text>;
        } else if (layout.type === 'box') {
            return <rect
                x={layout.x}
                y={layout.y}
                width={layout.width}
                height={layout.height}
                onClick={() => console.log(`${layout.id} clicked`)}
            />;
        }
    }

    render() {
        const {layout} = this.state;

        const svg = <svg width="512" height="512" style={{backgroundColor:'white'}}>
            {this.renderLayout(layout, 100, 100)}
        </svg>;

        return svg;
    }
}

export { SvgTest as default };
