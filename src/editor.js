import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import SvgTest from './svg-test';

window.onload = () => {
    const container = document.getElementById('app-container');

    ReactDOM.render(<SvgTest/>, container);
};
