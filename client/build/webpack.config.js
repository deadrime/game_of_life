const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// Naming and path settings
let appName = 'app';
const entryPoint = './src/main.js';
const exportPath = path.resolve(__dirname, '../dist');

// Enviroment flag
const plugins = [
	new ExtractTextPlugin('style.css')
];
const env = process.env.WEBPACK_ENV;

// Differ settings based on production flag
if (env === 'production') {
	const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

	plugins.push(new UglifyJsPlugin());
	plugins.push(new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}
	));
}

appName = appName + '.js';

// Main Settings config
module.exports = {
	entry: entryPoint,
	output: {
		path: exportPath,
		filename: appName
	},
	devServer: {
		contentBase: path.resolve(__dirname, '../'),
		compress: true,
		port: 9000
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					extractCSS: true
				}
			}
		]
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},
	plugins
};
