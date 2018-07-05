const path = require('path');
const webpack = require('webpack');
const Merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const baseConfig = require('./webpack.base.js');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const postcssConfig = {
  loader: 'postcss-loader',
  options: {
    plugins: () => [
      autoprefixer({browsers: ['> 1%', 'last 4 versions']}),
      pxtorem({
          rootValue: 100,
          propWhiteList: [],
      })
    ]
  }
};
const port = 9010;
module.exports = env => {
  return Merge(baseConfig, {
    entry: [
      'babel-polyfill',
      'react-hot-loader/patch',
      path.resolve(__dirname, 'src/index.js'),
    ],
    output: {
      filename: "app.[hash:8].js",
      chunkFilename: '[name].[chunkhash:8].chunk.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },
    devServer: {
      contentBase: path.resolve(__dirname),
      compress: true,
      historyApiFallback: true,
      hot: true,
      inline: true,
      port: port,
      host: '0.0.0.0',
      disableHostCheck: true,
      proxy: [
        {
          context: ['/omega/**'],
          target: 'https://gw-api-omega-qa.qingchunbank.com/',
          secure: false
        }
      ]
    },
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true,
                sourceMap: true
              }
            },
            postcssConfig,
          ]
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            postcssConfig,
            {
              loader: 'sass-loader',
              options: {
                sassLoader: {
                  includePaths: [
                    path.resolve(__dirname, "src/style"),
                    path.resolve(__dirname, "src/components")
                  ]
                }
              }
            }
          ],
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),   // Enable HMR
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
        'BUILD_ENV': JSON.stringify(env)
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        htmlWebpackPlugin: {
          'files': {
            'js': ['index.js']
          }
        }
      }),
      new webpack.ProvidePlugin({
          $: 'zepto-webpack'
      }),
      new OpenBrowserPlugin({ url: 'http://localhost:'+port})
    ]
  });
}