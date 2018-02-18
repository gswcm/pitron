const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');

//-- Cleanup
exports.cleanup = (path) => ({
	plugins: [new CleanWebpackPlugin([path])]
});

//-- Webpack DevServer configurationm
exports.devServer = ({ host, port } = {}) => ({
	devServer: {
		hot: true,
		inline: true,
		quiet: true,
		overlay: true,
		stats: "errors-only",
		historyApiFallback: true,
		contentBase: path.join(__dirname, "build"),
		proxy: {
			'/api': 'http://localhost:4000',
			'/socket.io': 'http://localhost:4000',
			'/about': 'http://localhost:4000'
		},
		host,
		port
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
});

//-- Font loader
exports.loadFonts = ({ include, exclude, options } = {}) => ({
	module: {
		rules: [
			{
				test: /\.(otf|ttf|eot|woff|woff2|svg)$/,
				include,
				exclude,
				loader: "file-loader",
				options
			}
		]
	}
});

//-- CSS loaders
exports.loadCSS = ({ include, exclude } = {}) => ({
	module: {
		rules: [
			{
				test: /\.(css|scss|sass)$/,
				include,
				exclude,
				use: ["style-loader", "css-loader", "sass-loader"]
			}
		]
	}
});

//-- Extract CSS as text
exports.extractCSS = ({ include, exclude, use }) => {
	const plugin = new ExtractTextPlugin({
		allChunks: true,
		filename: "[name].css"
	});
	return {
		module: {
			rules: [
				{
					test: /\.(css|scss|sass)$/,
					include,
					exclude,
					use: plugin.extract({
						fallback: "style-loader",
						use
					})
				}
			]
		},
		plugins: [plugin]
	};
};

//-- Autoprefixer
exports.autoprefix = () => ({
	loader: "postcss-loader",
	options: {
		plugins: () => [require("autoprefixer")()]
	}
});

//-- Load other root assets
exports.loadAssets = () => ({
	module: {
		rules: [
			{
				test: /\/assets\/.+$/,
				loader: "file-loader",
				options: {
					name: "[name].[ext]"
				}
			}
		]
	}
}),
//-- Load VUE components
exports.loadVue = () => ({
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: "vue-loader"
			},
		]
	}
});

//-- Load images
exports.loadImages = ({ include, exclude, options } = {}) => ({
	module: {
		rules: [
			{
				test: /\.(png|jpg)$/,
				include,
				exclude,
				use: [
					{
						loader: "url-loader",
						options
					}
				]
			}
		]
	}
});

//-- Source maps
exports.generateSourceMaps = ({ type }) => ({
	devtool: type
});

//-- Extract bundles
exports.extractBundles = bundles => ({
	plugins: bundles.map(bundle => new webpack.optimize.CommonsChunkPlugin(bundle))
});

//-- Optimization
exports.minifyJavaScript = (options) => ({
	plugins: [
		new UglifyWebpackPlugin(options)
	]
});
exports.minifyCSS = (options) => ({
	plugins: [
		new OptimizeCSSAssetsPlugin({
			cssProcessor: cssnano,
			cssProcessorOptions: options,
			canPrint: false
		})
	]
});

//-- Environment
exports.setFreeVariable = (key, value) => {
	const env = {};
	env[key] = JSON.stringify(value);
	return {
		plugins: [
			new webpack.DefinePlugin(env)
		],
	}; 
};
