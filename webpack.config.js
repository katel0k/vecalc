const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');

module.exports = {
	mode: 'none',
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),
    ],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: ['babel-loader']
			},
			{
				test: /\.scss$|\.sass$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			},
            {
                test: /\.(png|svg|jpg|gif)$/,
                exclude: /node_modules/,
                use: ["file-loader"]
            },
		]
	}
}
