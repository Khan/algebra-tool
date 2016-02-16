import React, { Component } from 'react';

const cursors = [];

let visibility = true;

const update = () => {
    return setTimeout(() => {
        visibility = !visibility;
        cursors.forEach(cursor => cursor.updateVisibility(visibility));
        update();
    }, 500);
};

update();

class Cursor extends Component {
    state = {
        visibility: true,
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
        cursors.push(this);
    }

    componentWillUnmount() {
        const index = cursors.indexOf(this);
        cursors.splice(index, 1);
    }

    updateVisibility(visibility) {
        this.setState({ visibility });
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
