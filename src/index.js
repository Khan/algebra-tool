import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './ui/app';
import store from './store';

const container = document.getElementById('app-container');

window.onload = () => {
    setTimeout(() => {
        const style = {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center'
        };

        const isMobile = /mobile/i.test(navigator.userAgent);

        const width = isMobile ? window.innerWidth : 320;
        const height = isMobile ? window.innerHeight : 568;

        const provider = <Provider store={store}>
            <div style={style}>
                <App width={width} height={height} />
            </div>
        </Provider>;

        ReactDOM.render(provider, container);
    }, 50);
};
