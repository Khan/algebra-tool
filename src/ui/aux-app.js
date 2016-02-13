import React, { Component } from 'react';
import { connect } from 'react-redux';

import NewKeypad from './new-keypad';
import TextLine from './text-line';
import auxStore from './../aux-store';
import StaticMath from './static-math';
import Parser from '../parser';

const parser = new Parser();

function easeCubic(t) {
    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function easeQuadratic(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

class AuxApp extends Component {
    select = (step, target) => {
        const {offsetHeight, scrollTop} = this.refs.container;
        const center = target.offsetTop - scrollTop + target.offsetHeight / 2;
        // TODO: take into account the offsetTop of the container

        const currentScrollTop = scrollTop;
        const futureScrollTop = Math.max(0, scrollTop - (offsetHeight / 2 - center));

        let t = 0;

        const animate = () => {
            if (t < 1) {
                t = Math.min(t + 0.05, 1);
                const u = easeQuadratic(t);
                this.refs.container.scrollTop =
                    parseInt(u * futureScrollTop + (1 - u) * currentScrollTop);

                requestAnimationFrame(animate);
            }
        };

        // TODO: only animate the scrollTop if the item is partially off-screen
        //requestAnimationFrame(animate);

        auxStore.dispatch({
            type: 'SELECT_STEP',
            step: step
        });
    };

    componentDidMount() {
        const {offsetHeight, scrollHeight} = this.refs.container;

        if (scrollHeight > offsetHeight) {
            this.refs.container.scrollTop = scrollHeight - offsetHeight;
        }
    }

    render() {
        const style = {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
        };

        const containerStyle = {
            flexGrow: 1,
            overflow: 'scroll',
            background: '#EEE',
        };

        const lineStyle = {
            fontFamily: 'Helvetica-Light',
            fontSize: 26,
        };

        const math = parser.parse('x = 5/2');

        //const goal = <div style={{...lineStyle, paddingLeft: 20, marginTop: 5, marginBottom: 5}}>
        //    <div style={{float:'left', height: 60, lineHeight: '60px'}}>Goal: </div>
        //    <StaticMath fontSize={26} active={true} math={math} width={65} height={60} />
        //</div>;

        return <div style={style}>
            <div style={containerStyle} ref="container">
                <div style={{height:180}}></div>
                {this.props.steps.map((line, i) =>
                    <TextLine
                        {...line}
                        key={i}
                        onClick={e => this.select(i, e.target)}
                        active={this.props.activeStep === i}
                    />)
                }
                <div style={{height:180}}></div>
            </div>
            <NewKeypad />
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
