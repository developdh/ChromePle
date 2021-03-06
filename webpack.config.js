const path = require('path');
const EncodingPlugin = require('webpack-encoding-plugin');

module.exports = {
    entry: {
        background: './src/background/index.ts',
        options: './src/options/index.ts',
        popup: './src/popup/index.ts',
        execute: './src/execute/index.ts'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/scripts'),
    },
    plugins: [
        new EncodingPlugin({
            encoding: 'utf-8'
        })
    ]
};