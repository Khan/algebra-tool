const params = location.search.slice(1).split('&').reduce((params, param) => {
    const [key, value] = param.split('=');
    params[key] = decodeURIComponent(value);
    return params;
}, {});

export { params as default };
