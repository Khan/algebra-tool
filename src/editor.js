import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import SvgTest from './svg-test';

window.onload = () => {
    const container = document.getElementById('app-container');

    ReactDOM.render(<SvgTest math='(12x+1)/2 = 7' />, container);
};
