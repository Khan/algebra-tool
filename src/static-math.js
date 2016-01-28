const React = require('react');
const { connect } = require('react-redux');

const { createFlatLayout } = require('./layout.js');
const store = require('./store.js');
const { findNode } = require('./ast/node-utils.js');

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

        const { layout } = this.state;
        const { math } = this.props;
        const touch = e.changedTouches[0];
        const layoutNode = layout.hitTest(touch.pageX, touch.pageY - container.offsetTop);
        const astNode = findNode(math, layoutNode.id);

        store.dispatch({
            type: 'UPDATE_CURSOR',
            node: astNode,
        });
    };

    handleTouchEnd = (e) => {
        if (!this.props.active) {
            return;
        }
        const container = this.refs.container;

        const { layout } = this.state;
        const { math } = this.props;
        const touch = e.changedTouches[0];
        const layoutNode = layout.hitTest(touch.pageX, touch.pageY - container.offsetTop);
        const astNode = findNode(math, layoutNode.id);

        store.dispatch({
            type: 'UPDATE_CURSOR',
            node: astNode,
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

        const astNode = this.props.cursorNode;

        if (this.props.active && astNode) {

            const layoutDict = {};

            // layout node ids start with the math node's id but may contain additional
            // strings separate by ':' to disambiguate different parts of a layout
            // that belong to the same math node.
            currentLayout.children.forEach(child => {
                const id = child.id.split(':')[0];
                if (!layoutDict.hasOwnProperty(id)) {
                    layoutDict[id] = [];
                }
                layoutDict[id].push(child);
            });

            const layoutNodes = layoutDict[astNode.id];

            if (layoutNodes.length === 1) {
                const bounds = layoutNodes[0].getBounds();
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
