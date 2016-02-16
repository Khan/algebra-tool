import React, { Component } from 'react';


class Cursor extends Component {
    state = {
        visibility: true,
        delay: 500,
        timeout: null
    };

    static defaultProps = {
        x: 0,
        y: 0,
        width: 2,
        height: 30,
        color: 'rgb(0, 208, 208)'
    };

    componentDidMount() {
        const { delay } = this.state;
        const timeout = setTimeout(() => this.updateVisibility(), delay);
        this.setState({ timeout });
    }

    updateVisibility() {
        const { visibility, delay } = this.state;
        const timeout = setTimeout(() => this.updateVisibility(), delay);
        this.setState({ visibility: !visibility, timeout });
    }

    componentWillUnmount() {
        clearTimeout(this.state.timeout);
    }

    render() {
        const { x, y, width, height, color } = this.props;
        const { visibility } = this.state;

        const style = {
            position: 'absolute',
            left: x,
            top: y,
            width,
            height,
            visibility: visibility ? 'visible' : 'hidden',
            backgroundColor: color
        };

        return <div style={style}></div>;
    }
}

export { Cursor as default };
