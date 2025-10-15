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
filename: 'widget.js', // Changed from widget.bundle.js
path: path.resolve(__dirname, 'build_for_sedk'), // Changed output directory
},
};