const React = require('react');

const { createFlatLayout } = require('./layout.js');

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

    componentWillReceiveProps(nextProps) {
        //const { fontSize, math } = nextProps;
        //
        //let layout = createFlatLayout(
        //    math, fontSize, window.innerWidth, window.innerHeight);
        //
        //this.setState({ layout });
    }

    componentWillUpdate(nextProps, nextState) {
        //const { context } = this.state;
        //
        //if (context) {
        //    const canvas = context.canvas;
        //    context.clearRect(0, 0, canvas.width, canvas.height);
        //
        //    const currentLayout = this.state.layout;
        //    const nextLayout = nextState.layout;
        //
        //    const { selections, hitNode } = nextState;
        //
        //    if (selections.getLength() > 0) {
        //        this.drawSelection(selections, hitNode, nextLayout, nextState);
        //    }
        //
        //    context.fillStyle = nextProps.color;
        //
        //    if (currentLayout !== nextLayout) {
        //        const animatedLayout = new AnimatedLayout(currentLayout, nextLayout);
        //
        //        let t = 0;
        //        animatedLayout.callback = () => {
        //            context.clearRect(0, 0, canvas.width, canvas.height);
        //            this.drawLayout(context, animatedLayout);
        //            t += 0.035;
        //        };
        //
        //        animatedLayout.start();
        //    } else {
        //        this.drawLayout(context, currentLayout);
        //    }
        //}
    }

    drawLayout(context, currentLayout) {
        context.fillStyle = 'rgb(0, 0, 0)';
        currentLayout.render(context);

    }

    render() {
        return <div>
            <div ref="container"></div>
        </div>;
    }
}

module.exports = StaticMath;
