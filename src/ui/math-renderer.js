import React, { Component } from 'react';

import Cursor from './cursor';
import Rect from '../layout/rect';
import { createFlatLayout } from '../layout/layout.js';
import { findNode, traverseNode } from '../ast/node-utils';
import AnimatedLayout from '../layout/animated-layout';
import { roundRect, fillCircle } from './canvas-util';
import Selection from './selection';
import store from './../store';


class MathRenderer extends Component {
    state = {
        context: null,
        layout: null,
    };

    static defaultProps = {
        color: 'black',
        fontSize: 60,
        maxId: Infinity,
        selections: [],
    };

    componentDidMount() {
        const { fontSize, math, selections, maxId } = this.props;

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

        this.drawLayout(context, layout, maxId);

        this.refs.container.appendChild(canvas);

        this.setState({ context, layout });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.math !== nextProps.math) {
            const { fontSize, math } = nextProps;
            const layout = createFlatLayout(math, fontSize, 6);
            let shouldShowCursor = false;
            traverseNode(math.root, node => {
                if (node.type === 'Placeholder') {
                    shouldShowCursor = true;
                }
            });
            this.setState({ layout, shouldShowCursor });
        }
    }

    componentWillUpdate(nextProps, nextState) {
        const { context } = this.state;

        if (context) {
            const canvas = context.canvas;
            context.clearRect(0, 0, canvas.width, canvas.height);

            const currentLayout = this.state.layout;
            const nextLayout = nextState.layout;

            const { hitNode, shouldShowCursor } = nextState;
            const { selections, maxId } = nextProps;

            if (selections.length > 0) {
                this.drawSelection(context, selections, hitNode, nextLayout);
            }

            context.fillStyle = nextProps.color;

            if (currentLayout !== nextLayout) {
                // if the cursor is showing don't animate because we're in the
                // process of typing something in
                if (nextProps.cursor) {
                    canvas.width = nextLayout.bounds.width;
                    canvas.height = nextLayout.bounds.height;
                    this.drawLayout(context, nextLayout, maxId);
                } else {
                    const animatedLayout = new AnimatedLayout(
                        currentLayout,
                        nextLayout,
                        () => {
                            canvas.width = animatedLayout.bounds.width;
                            canvas.height = animatedLayout.bounds.height;
                            this.drawLayout(context, animatedLayout, maxId);
                        },
                        () => {
                            if (shouldShowCursor) {
                                store.dispatch({ type: 'SHOW_CURSOR' });
                            }
                            store.dispatch({ type: 'CHECK_ANSWER' });
                        });

                    animatedLayout.start();
                }
            } else {
                this.drawLayout(context, currentLayout, maxId);
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
                if (node.type === 'Equation') {
                    // TODO: handle the case if there's more than one in the array
                    layouts.push(layoutDict[node.id][0]);
                } else {
                    traverseNode(node, (node) => {
                        if (layoutDict.hasOwnProperty(node.id)) {
                            layouts.push(...layoutDict[node.id]);
                        }
                    });
                }
            }

            const highlight = {
                shape: layouts.length === 1 && layouts[0].circle ? 'circle' : 'rect',
                bounds: Rect.union(layouts.map(layout => layout.bounds)),
            };
            if (highlight.shape === 'rect') {
                // add some extra padding around skinny symbols such as '1'
                highlight.bounds.width = Math.max(highlight.bounds.width, 9);
            }
            highlights.push(highlight);
        });

        return highlights;
    }

    drawLayout(context, currentLayout, maxId) {
        context.fillStyle = 'rgb(0, 0, 0)';
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
        if (!this.props.active || this.props.cursor) return;

        const touch = e.changedTouches[0];

        const { x, y } = this.getRelativeCoordinates(touch);
        this.handlePointerStart(x, y, e);
    };

    handleTouchMove = e => {
        if (!this.props.active || this.props.cursor) return;
        if (this.state.mouse !== 'down') return;

        const touch = e.changedTouches[0];

        const { x, y } = this.getRelativeCoordinates(touch);
        this.handlePointerMove(x, y);
    };

    handleTouchEnd = e => {
        if (!this.props.active || this.props.cursor) return;

        e.preventDefault();
        const touch = e.changedTouches[0];

        const { x, y } = this.getRelativeCoordinates(touch);
        this.handlePointerEnd(x, y);
    };

    handleMouseDown = e => {
        if (!this.props.active || this.props.cursor) return;
        const { x, y } = this.getRelativeCoordinates(e);
        this.handlePointerStart(x, y, e);
    };

    handleMouseMove = e => {
        if (!this.props.active || this.props.cursor) return;
        if (this.state.mouse !== 'down') return;
        const { x, y } = this.getRelativeCoordinates(e);
        this.handlePointerMove(x, y);
    };

    handleMouseUp = e => {
        if (!this.props.active || this.props.cursor) return;
        e.preventDefault();
        const { x, y } = this.getRelativeCoordinates(e);
        this.handlePointerEnd(x, y);
    };

    handlePointerStart(x, y, e) {
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
                store.dispatch({
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

            store.dispatch({
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
    }

    handlePointerMove(x, y) {
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

                store.dispatch({
                    type: 'SELECT_MATH',
                    selections: [...prevSels, selection]
                });
            }
        } else {
            this.setState({ scrolling: true });
        }
    }

    handlePointerEnd(x, y) {
        const { layout, mouse, scrolling } = this.state;
        const hitNode = layout.hitTest(x, y);

        // TODO: figure out selection semantics that prevent users from creating non-sensical selections
        if (mouse === 'down') {
            if (!hitNode && !scrolling) {
                store.dispatch({
                    type: 'SELECT_MATH',
                    selections: []
                });
                if (this.props.hideMenu) {
                    this.props.hideMenu();
                }
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
    }

    render() {

        const { cursor, fontSize, math } = this.props;

        // max number of cursors support is 2
        const cursors = [];

        if (cursor) {
            const placeholders = [];
            traverseNode(math.root, node => {
                if (node.type === 'Placeholder') {
                    placeholders.push(node);
                }
            });

            for (const placeholder of placeholders) {
                const layout = this.state.layout;

                let x = 0;
                let y = 0;

                for (const node of layout.children) {
                    if (node.id === placeholder.id) {
                        x = node.x + 20;
                        for (const glyph of node.children) {
                            x += glyph.advance;
                        }

                        // 6 is padding built into the canvas rendering
                        // -15 is padding above the container
                        y = node.y + 6 - 15;
                    }
                }
                cursors.push(<Cursor x={x} y={y} width={2} height={fontSize} />);
            }
        }

        return <div
            ref="container"
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
        >
            {cursors[0]}
            {cursors[1]}
        </div>;
    }
}

export { MathRenderer as default };
