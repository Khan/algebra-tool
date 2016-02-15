import React, { Component } from 'react';

import Rect from '../layout/rect';
import { createFlatLayout } from '../layout/layout.js';
import { findNode, traverseNode } from '../ast/node-utils';
import AnimatedLayout from '../layout/animated-layout';
import { roundRect, fillCircle } from './canvas-util';
import Selection from './selection';
import auxStore from './../aux-store';


class MathRenderer extends Component {
    constructor() {
        super();

        this.state = {
            context: null,
            layout: null,
        };
    }

    static defaultProps = {
        color: 'black',
        fontSize: 60,
        maxId: Infinity,
        selections: [],
    };

    componentDidMount() {
        const { fontSize, math, selections } = this.props;

        const layout = createFlatLayout(math, fontSize, 6);
        const bounds = layout.bounds;

        const canvas = document.createElement('canvas');
        canvas.width = bounds.width;
        canvas.height = bounds.height;
        canvas.style.display = 'block';

        const context = canvas.getContext('2d');

        if (selections.length > 0) {
            this.drawSelection(context, selections, null, layout);
        }

        this.drawLayout(context, layout);

        this.refs.container.appendChild(canvas);

        this.setState({ context, layout });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.math !== nextProps.math) {
            const { fontSize, math } = nextProps;
            const layout = createFlatLayout(math, fontSize, 6);
            this.setState({ layout });
        }
    }

    componentWillUpdate(nextProps, nextState) {
        const { context } = this.state;

        if (context) {
            const canvas = context.canvas;
            context.clearRect(0, 0, canvas.width, canvas.height);

            const currentLayout = this.state.layout;
            const nextLayout = nextState.layout;

            const { hitNode } = nextState;
            const { selections } = nextProps;

            if (selections.length > 0) {
                this.drawSelection(context, selections, hitNode, nextLayout);
            }

            context.fillStyle = nextProps.color;

            if (currentLayout !== nextLayout) {
                const animatedLayout = new AnimatedLayout(currentLayout, nextLayout);

                canvas.width = animatedLayout.bounds.width;
                canvas.height = animatedLayout.bounds.height;

                let t = 0;
                // TODO: add some way to be notified of when the animation completes
                animatedLayout.callback = () => {
                    canvas.width = animatedLayout.bounds.width;
                    canvas.height = animatedLayout.bounds.height;
                    this.drawLayout(context, animatedLayout);
                    t += 0.035;
                };

                animatedLayout.start();
            } else {
                this.drawLayout(context, currentLayout);
            }
        }
    }

    // TODO: get rid of the need for hitNode
    getSelectionHighlights(layout, selections, hitNode) {
        const layoutDict = {};

        // layout node ids start with the math node's id but may contain additional
        // strings separate by ':' to disambiguate different parts of a layout
        // that belong to the same math node.
        layout.children.forEach(child => {
            const id = child.id.split(':')[0];
            if (!layoutDict.hasOwnProperty(id)) {
                layoutDict[id] = [];
            }
            layoutDict[id].push(child);
        });

        const highlights = [];

        selections.forEach(selection => {
            const layouts = [];

            for (const node of selection) {
                if (node.type === 'Equation' && hitNode.text === "=") {
                    layouts.push(hitNode);
                } else {
                    traverseNode(node, (node) => {
                        if (layoutDict.hasOwnProperty(node.id)) {
                            layouts.push(...layoutDict[node.id]);
                        }
                    });
                }
            }

            highlights.push({
                shape: layouts.length === 1 && layouts[0].circle ? 'circle' : 'rect',
                bounds: Rect.union(layouts.map(layout => layout.bounds)),
            });
        });

        return highlights;
    }

    drawLayout(context, currentLayout) {
        context.fillStyle = 'rgb(0, 0, 0)';
        const { maxId } = this.props;
        currentLayout.render(context, maxId);
    }

    drawSelection(context, selections, hitNode, layout) {
        const highlights = this.getSelectionHighlights(layout, selections, hitNode);
        const padding = 4;

        context.fillStyle = 'rgba(0, 208, 208, 1.0)';

        for (const {shape, bounds} of highlights) {
            if (shape === 'circle') {
                const x = (bounds.left + bounds.right) / 2;
                const y = (bounds.top + bounds.bottom) / 2;
                const radius = (bounds.right - bounds.left) / 2 + padding;
                fillCircle(context, x, y, radius);
            } else {
                const radius = padding;
                const x = bounds.left - radius;
                const y = bounds.top - radius;
                const width = bounds.right - bounds.left + 2 * radius;
                const height = bounds.bottom - bounds.top + 2 * radius;
                roundRect(context, x, y, width, height, radius);
            }
        }
    }

    getRelativeCoordinates(touch) {
        const container = this.refs.container;
        const clientRect = container.getBoundingClientRect();
        //const scrollTop = getScrollTop(container);

        const x = touch.pageX - clientRect.left;
        const y = touch.pageY - clientRect.top;

        return { x, y };
    }

    handleTouchStart = e => {
        if (!this.props.active) return;

        const touch = e.changedTouches[0];

        console.log(touch);

        const { x, y } = this.getRelativeCoordinates(touch);
        const { math, selections } = this.props;
        const { layout } = this.state;
        const hitNode = layout.hitTest(x, y);

        // TODO: check if the click is inside a highlight
        if (hitNode && hitNode.selectable) {
            e.preventDefault();

            const id = hitNode.id.split(":")[0];
            let mathNode = findNode(math, id);

            // TODO: handle enlarging the selection by dragging
            // TODO: tap a selection again to toggle it
            // tap in whitepsace to drop all selections
            // if you've already created a selection as part of multiselect and
            // then you grow a new selection... the new selection will actively
            // reject growing to including any of the existing selections

            if (!mathNode) {
                auxStore.dispatch({
                    type: 'SELECT_MATH',
                    selections: []
                });

                return;
            }

            let newSelections = [];

            if (selections.every(selection => !selection.includes(mathNode))) {
                newSelections = [...selections, new Selection(mathNode)];
            } else {
                const index = selections.findIndex(selection => selection.includes(mathNode));

                if (index != undefined) {
                    newSelections = [...selections.slice(0, index), ...selections.slice(index + 1)];
                }
            }

            auxStore.dispatch({
                type: 'SELECT_MATH',
                selections: newSelections
            });

            this.setState({
                hitNode,
                mouse: 'down',
            });
        } else {
            this.setState({
                mouse: 'down',
            });
        }
    };

    handleTouchMove = e => {
        if (!this.props.active) return;
        if (this.state.mouse !== 'down') return;

        const touch = e.changedTouches[0];

        const { x, y } = this.getRelativeCoordinates(touch);
        const { math, selections } = this.props;
        const { layout } = this.state;

        const hitNode = layout.hitTest(x, y);

        if (hitNode && hitNode.selectable) {
            const id = hitNode.id.split(":")[0];
            let mathNode = findNode(math, id);

            if (selections.length > 0) {
                const prevSels = selections.slice(0, selections.length - 1);

                if (prevSels.some(sel => sel.includes(mathNode))) {
                    return;
                }

                const selection = selections[selections.length - 1].clone();

                selection.add(mathNode);

                // abort if the new selection in intersecting previous selections
                if (prevSels.some(previous => previous.intersects(selection))) {
                    return;
                }

                auxStore.dispatch({
                    type: 'SELECT_MATH',
                    selections: [...prevSels, selection]
                });
            }
        } else {
            this.setState({ scrolling: true });
        }
    };

    handleTouchEnd = e => {
        if (!this.props.active) return;

        e.preventDefault();
        const touch = e.changedTouches[0];

        const { x, y } = this.getRelativeCoordinates(touch);
        const { layout, mouse, scrolling } = this.state;
        const hitNode = layout.hitTest(x, y);

        // TODO: figure out selection semantics that prevent users from creating non-sensical selections
        if (mouse === 'down') {
            if (!hitNode && !scrolling) {
                auxStore.dispatch({
                    type: 'SELECT_MATH',
                    selections: []
                });
            } else {
                if (this.props.showMenu) {
                    this.props.showMenu();
                }
            }

            this.setState({
                mouse: 'up',
                scrolling: false,
            });
        }
    };

    render() {
        return <div>
            <div
                ref="container"
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handleTouchEnd}
            ></div>
        </div>;
    }
}

module.exports = MathRenderer;
