import React, {Component} from 'react';

import Parser from './parser';
import { createFlatLayout } from './layout/layout.js';


const parser = new Parser();


class SvgTest extends Component {
    constructor(props) {
        super();

        const mathAST = parser.parse(props.math);
        const layout = createFlatLayout(mathAST, 32);
        layout.x = 50;
        layout.y = 50;
        console.log(layout);

        this.state = {
            cursor: null,
            layout: layout,
        };
    }

    renderLayout(layout) {
        if (layout.type === 'layout') { // TODO(kevinb) change this to group
            return <g transform={`translate(${layout.x}, ${layout.y})`} >
                {layout.children.map(child => this.renderLayout(child))}
            </g>
        } else if (layout.type === 'glyph') {
            // TODO: return the id and index for each of these
            return <text
                x={layout.x}
                y={layout.y}
                fontFamily="Helvetica-Light"
                fontSize={layout.font.size}
            >
                {layout.text}
            </text>;
        } else if (layout.type === 'box') {
            return <rect
                x={layout.x}
                y={layout.y}
                width={layout.width}
                height={layout.height}
            />;
        }
    }

    handleClick = (e) => {
        const node = this.state.layout.hitTest(e.pageX, e.pageY);
        console.log(node);
    };

    render() {
        const {layout} = this.state;

        const svg = <svg
            width="512"
            height="512"
            style={{backgroundColor:'white'}}
            onClick={this.handleClick}
        >
            {this.renderLayout(layout)}
        </svg>;

        return svg;
    }
}

export { SvgTest as default };
