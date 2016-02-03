import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import StaticMath from './ui/static-math';
import Parser from './parser';
import store from './store';

const parser = new Parser();

window.onload = () => {
    const container = document.getElementById('app-container');
    const math = parser.parse('2x + 5 = 10');
    const provider = <Provider store={store}>
        <StaticMath
            active={true}
            fontSize={30}
            width={200}
            height={50}
            math={math}
        />
    </Provider>;
    ReactDOM.render(provider, container);
};
