import React, {Component} from 'react';

class SvgTest extends Component {
    render() {
        // TODO: create a renderer which outputs SVG from a flat layout

        const svg = <svg width="512" height="512" style={{backgroundColor:'white'}}>
            <text x="100" y="100" fontFamily="helvetica-light" fontSize="26px">
                2x + 5 = 10
            </text>
        </svg>;

        return svg;
    }
}

export { SvgTest as default };
