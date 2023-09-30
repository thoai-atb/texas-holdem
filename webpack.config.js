const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node', // for node, not browser
  entry: './server.js',
  output: {
    filename: 'texas-holdem.js',
    path: path.resolve(__dirname, 'build'),
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
};