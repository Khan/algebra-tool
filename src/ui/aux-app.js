import React, { Component } from 'react';
import { connect } from 'react-redux';

import NewKeypad from './new-keypad';
import TextLine from './text-line';
import auxStore from './../aux-store';
import StaticMath from './static-math';
import Parser from '../parser';

const parser = new Parser();

class AuxApp extends Component {
    select = step => {
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
                {this.props.steps.map((line, i) =>
                    <TextLine
                        {...line}
                        key={i}
                        onClick={() => this.select(i)}
                        active={this.props.activeStep === i}
                    />)
                }
                <div style={{height:120, backgroundColor:'#DDD'}}></div>
            </div>
            <NewKeypad />
        </div>;
    }
}

module.exports = connect(state => state)(AuxApp);
