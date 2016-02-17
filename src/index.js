import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './ui/app';
import store from './store';

const container = document.getElementById('app-container');

window.onload = () => {
    setTimeout(() => {
        const provider = <Provider store={store}>
            <App />
        </Provider>;
        ReactDOM.render(provider, container);
    }, 50);
};
