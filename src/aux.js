import React from 'react';
import ReactDOM from 'react-dom';

import AuxApp from './ui/aux-app';

const container = document.getElementById('app-container');

window.onload = () => {
    ReactDOM.render(<AuxApp />, container);
};
