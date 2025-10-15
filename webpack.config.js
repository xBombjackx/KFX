const path = require('path');

module.exports = {
  entry: './src/widget.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'widget.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
