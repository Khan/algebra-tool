const React = require('react');
const ReactDOM = require('react-dom');
const { Provider } = require('react-redux');

const App = require('./ui/app.js');
const store = require('./store.js');

const container = document.getElementById('app-container');

window.onload = function() {
    const provider = <Provider store={store}>
        <App/>
    </Provider>;
    ReactDOM.render(provider, container);
};
