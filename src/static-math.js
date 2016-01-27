const React = require('react');
const { connect } = require('react-redux');

const { createFlatLayout } = require('./layout.js');
const store = require('./store.js');

class StaticMath extends React.Component {
    constructor() {
        super();

        this.state = {
            context: null,
            menu: null,
            selections: [],
            layout: null,
            start: null,
        };
    }

    componentDidMount() {
        const container = this.refs.container;

        const canvas = document.createElement('canvas');
        canvas.width = this.props.width;
        canvas.height = this.props.height;

        const { fontSize, math } = this.props;

        let layout = createFlatLayout(
            math, fontSize, canvas.width, canvas.height);

        const context = canvas.getContext('2d');

        this.drawLayout(context, layout);

        container.appendChild(canvas);

        this.setState({ context, layout });
    }

    handleTouchStart = (e) => {
        if (!this.props.active) {
            return;
        }
        const container = this.refs.container;

        const {layout} = this.state;
        const touch = e.changedTouches[0];
        const node = layout.hitTest(touch.pageX, touch.pageY - container.offsetTop);

        store.dispatch({
            type: 'UPDATE_CURSOR',
            node: node,
        });
    };

    handleTouchEnd = (e) => {
        if (!this.props.active) {
            return;
        }
        const container = this.refs.container;

        const {layout} = this.state;
        const touch = e.changedTouches[0];
        const node = layout.hitTest(touch.pageX, touch.pageY - container.offsetTop);

        store.dispatch({
            type: 'UPDATE_CURSOR',
            node: node,
        });
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.cursorNode !== this.props.cursorNode) {
            this.drawLayout(this.state.context, this.state.layout);
        }
    };

    drawLayout(context, currentLayout) {
        context.clearRect(0, 0, this.props.width, this.props.height);
        context.fillStyle = 'rgba(255,255,0,0.5)';

        if (this.props.active) {
            const cursorLayout = this.props.cursorNode;
            if (cursorLayout) {
                const bounds = cursorLayout.getBounds();
                const width = bounds.right - bounds.left;
                const height = bounds.bottom - bounds.top;
                context.fillRect(bounds.left, bounds.top, width, height);
            }
        }

        context.fillStyle = this.props.active ? 'rgb(0, 0, 0)' : 'rgba(0, 0, 0, 0.25)';
        currentLayout.render(context);
    }

    render() {
        return <div onTouchEnd={this.handleTouchEnd}>
            <div ref="container"></div>
        </div>;
    }
}

module.exports = connect(state => state)(StaticMath);
