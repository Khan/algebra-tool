import React, { Component } from 'react';

//import Menu from './menu';
//import transforms from '../transforms.js';

import Rect from '../layout/rect';
import { createFlatLayout } from '../layout/layout.js';
import { findNode, traverseNode } from '../ast/node-utils';
import AnimatedLayout from '../layout/animated-layout';
import { roundRect, fillCircle } from './canvas-util';
import Selection from './selection';

const transforms = {};

// TODO: generalize to find all ancestors that can be scrolled
function getScrollTop(node) {
    while (node != null) {
        if (node.scrollHeight !== node.offsetHeight) {
            return node.scrollTop;
        }
        node = node.parentElement;
    }
    return 0;
}

class MathRenderer extends Component {
    constructor() {
        super();

        this.state = {
            context: null,
            menu: null,
            selections: [],
            layout: null,
        };
    }

    static defaultProps = {
        color: 'black',
        fontSize: 60,
    };

    componentDidMount() {
        const { fontSize, math } = this.props;
        const layout = createFlatLayout(math, fontSize, 6);
        const bounds = layout.bounds;

        const canvas = document.createElement('canvas');
        canvas.width = bounds.width;
        canvas.height = bounds.height;

        const context = canvas.getContext('2d');

        this.drawLayout(context, layout);

        this.refs.container.appendChild(canvas);

        this.setState({ context, layout });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.math !== nextProps.math) {
            const { fontSize, math, width, height } = nextProps;
            const layout = createFlatLayout(math, fontSize, width, height);
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

            const { selections, hitNode } = nextState;

            if (selections.length > 0) {
                this.drawSelection(selections, hitNode, nextLayout, nextState);
            }

            context.fillStyle = nextProps.color;

            if (currentLayout !== nextLayout) {
                const animatedLayout = new AnimatedLayout(currentLayout, nextLayout);

                let t = 0;
                animatedLayout.callback = () => {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawLayout(context, animatedLayout);
                    t += 0.035;
                };

                animatedLayout.start();
            } else {
                this.drawLayout(context, currentLayout);
            }
        }
    }

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
        currentLayout.render(context);

    }

    drawSelection(selections, hitNode, layout, nextState) {
        const { context } = this.state;

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

    performTransform(selections, transform) {
        this.props.onClick(selections, transform, () => {
            this.setState({
                menu: null,
                selections: [],
            });
        });
    }

    getMenu(layout, newSelections, hitNode) {
        // TODO: reverse the order of map and filter
        // that way canTransform can return the name of the action and filter
        // can filter out everything that returns an empty string
        const items = Object.values(transforms)
            .filter(transform => {
                if (newSelections.length === 1) {
                    return transform.canTransform(newSelections[0]);
                } else if (transform.hasOwnProperty('canTransformNodes')) {
                    return transform.canTransformNodes(newSelections);
                }
            })
            .map(transform => {
                let label = transform.label;
                if (transform.hasOwnProperty('getLabel')) {
                    label = transform.getLabel(newSelections[0]);
                }
                return {
                    label,
                    action: () => {
                        this.setState({ menu: null });
                        this.performTransform(newSelections, transform);
                    }
                }
            });

        const highlights = this.getSelectionHighlights(layout, newSelections, hitNode);

        const pos = { x:Infinity, y:Infinity };
        for (const {bounds} of highlights) {
            const x = (bounds.left + bounds.right) / 2;
            const y = bounds.top - 10;
            if (y < pos.y) {
                pos.x = x;
                pos.y = y;
            }
        }

        return items.length > 0 ? <Menu position={pos} items={items}/> : null;
    }

    getRelativeCoordinates(touch) {
        const container = this.refs.container;
        const scrollTop = getScrollTop(container);

        const x = touch.pageX - container.offsetLeft;
        const y = touch.pageY - container.offsetTop + scrollTop;

        return { x, y };
    }

    handleTouchStart = e => {
        if (!this.props.active) return;

        const touch = e.changedTouches[0];

        const { x, y } = this.getRelativeCoordinates(touch);
        const { math } = this.props;
        const { layout, selections } = this.state;
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
                this.setState({ menu: null, selections: [] });
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

            this.setState({
                selections: newSelections,
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
        const { math } = this.props;
        const { layout, selections } = this.state;

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

                this.setState({
                    selections: [...prevSels, selection],
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
        const { layout, selections, mouse, scrolling } = this.state;
        const hitNode = layout.hitTest(x, y);

        // TODO: figure out selection semantics that prevent users from creating non-sensical selections
        if (mouse === 'down') {
            let menu = null;

            if (selections.length > 0) {
                const {layout} = this.state;
                const hitNode = layout.hitTest(x, y);
                // used to position the menu by the selection
                // menu = this.getMenu(layout, selections, hitNode);
            }

            if (!hitNode && !scrolling) {
                this.setState({ selections: [] });
                if (this.props.onSelectionChange) {
                    this.props.onSelectionChange([]);
                }
            } else {
                if (this.props.onSelectionChange) {
                    this.props.onSelectionChange(selections);
                }
            }

            this.setState({
                menu,
                mouse: 'up',
                scrolling: false,
            });
        }
    };

    render() {
        const { menu } = this.state;

        return <div>
            <div
                ref="container"
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handleTouchEnd}
            ></div>
            {menu}
        </div>;
    }
}

module.exports = MathRenderer;
