var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel', exclude: /node_modules/ }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            }
        })
    ]
};
