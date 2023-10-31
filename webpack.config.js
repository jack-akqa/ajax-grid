/* global __dirname, require, module*/

const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const ModuleConcatenationPlugin = webpack.optimize.ModuleConcatenationPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const env = require('yargs').argv.env;

let libraryName = 'ajax-form';

let plugins = [];
let externals = {};
let outputFile;
let entries = [path.resolve('./src/index.js')];

if (env === 'build') {
	// add here all the dependencies
	// you don't want in the final bundle
	externals = {
		react: 'react'
	};
	plugins.push(
		new UglifyJsPlugin({ minimize: true }),
		new ModuleConcatenationPlugin()
	);
	outputFile = `${libraryName}.min.js`;
} else {
	entries.push(path.resolve('./demo/demo.js'));
	plugins.push(
		new HtmlWebpackPlugin({
			template: path.resolve('./demo/index.html')
		}),
		new webpack.HotModuleReplacementPlugin()
	);
	outputFile = `${libraryName}.js`;
}

const config = {
	entry: entries,
	externals: externals,
	devtool: 'source-map',
	output: {
		path: path.resolve('./dist'),
		filename: outputFile,
		library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	devServer: {
		overlay: {
			warnings: true,
			errors: true
		},
		compress: true
	},
	module: {
		rules: [
			{
				test: /(\.jsx|\.js)$/,
				loader: 'babel-loader',
				exclude: /(node_modules|bower_components)/
			},
			{
				test: /(\.jsx|\.js)$/,
				loader: 'eslint-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		modules: [
			path.resolve('./src'),
			path.resolve('node_modules')
		],
		extensions: ['.json', '.js']
	},
	plugins: plugins
};

module.exports = config;
