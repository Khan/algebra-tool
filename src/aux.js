import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import AuxApp from './ui/aux-app';
import auxStore from './aux-store';

const container = document.getElementById('app-container');

window.onload = () => {
    const provider = <Provider store={auxStore}>
        <AuxApp />
    </Provider>;
    ReactDOM.render(provider, container);
};
