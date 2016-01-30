const React = require('react');
const { connect } = require('react-redux');

const store = require('../store.js');
const { createFlatLayout } = require('./layout.js');
const { findNode } = require('../ast/node-utils.js');

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
        const scrollTop = container.parentElement.parentElement.scrollTop;

        const { layout } = this.state;
        const { math } = this.props;
        const touch = e.changedTouches[0];
        const layoutNode = layout.hitTest(touch.pageX, touch.pageY - container.offsetTop - scrollTop);

        store.dispatch({
            type: 'UPDATE_CURSOR',
            node: layoutNode ? findNode(math, layoutNode.id) : null,
        });
    };

    handleTouchEnd = (e) => {
        if (!this.props.active) {
            return;
        }
        const container = this.refs.container;
        const scrollTop = container.parentElement.parentElement.scrollTop;

        const { layout } = this.state;
        const { math } = this.props;
        const touch = e.changedTouches[0];
        const layoutNode = layout.hitTest(touch.pageX, touch.pageY - container.offsetTop + scrollTop);

        store.dispatch({
            type: 'UPDATE_CURSOR',
            node: layoutNode ? findNode(math, layoutNode.id) : null,
        });
    };

    componentWillReceiveProps(newProps) {
        if (this.props.math !== newProps.math) {
            const { math, fontSize, width, height } = newProps;
            let layout = createFlatLayout(
                math, fontSize, width, height);
            this.setState({ layout });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.cursorNode !== this.props.cursorNode || prevProps.cursorPosition !== this.props.cursorPosition) {
            this.drawLayout(this.state.context, this.state.layout);
        }
    }

    drawLayout(context, currentLayout) {
        context.clearRect(0, 0, this.props.width, this.props.height);
        context.strokeStyle = 'rgb(0,128,255)';
        context.lineWidth = 2;

        const astNode = this.props.cursorNode;
        const cursorPosition = this.props.cursorPosition;

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
                let layoutNode = layoutNodes[0];
                let right = cursorPosition > 0;

                const fontSize = layoutNode.fontSize;
                const bounds = layoutNode.getBounds();

                let x = bounds.left;

                if (layoutNode.children) {
                    right = cursorPosition === layoutNode.children.length;
                    if (cursorPosition < layoutNode.children.length) {
                        x += layoutNode.children[cursorPosition].x;
                    }
                }

                if (right) {
                    x = bounds.right;
                }

                context.beginPath();
                context.moveTo(x, layoutNode.y - 0.85 * fontSize);
                context.lineTo(x, layoutNode.y + 0.15 * fontSize);
                context.stroke();
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
