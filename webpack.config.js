var _ = require('underscore');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var packageJson = require('./package.json');

var libraryName = 'algorithm';
var banner = [
    "algorithm - Algorithm visualization library v" + packageJson.version,
    "Copyright (c) 2015-2017 TSV  - http://github.com/tsv2013/algorithm",
    "License: MIT (http://www.opensource.org/licenses/mit-license.php)",
].join("\n");

var BASE_CFG = {
  target: 'web',
  resolve: {
    extensions: ['.ts', '.jsx', '.tsx', '.scss'],
  },
  externals: {
      'knockout': {
          root: 'ko',
          commonjs2: 'knockout',
          commonjs: 'knockout',
          amd: 'knockout'
      },
      'jquery': {
          root: 'jQuery',
          commonjs2: 'jquery',
          commonjs: 'jquery',
          amd: 'jquery'
      }
  },
  module: {
      rules: [
          {
              test: /\.(ts|tsx)$/,
              loader: 'ts-loader',
              options: {
                  compilerOptions: {
                      //'declaration': true,
                      //'outDir': 'typings/'
                  }
              }
          },
          {
              test: /\.scss$/,
              loader: ExtractTextPlugin.extract({
                  fallbackLoader: 'style-loader',
                  loader: 'css-loader!sass-loader'
              })
          }
      ]
  },
  entry: './sources/bindings.ts',
};

var DEV_CFG = _.extend({}, BASE_CFG, {
  plugins: [
    new ExtractTextPlugin({ filename: libraryName + '.css' })
  ],
  output: {
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: 'dist',
    filename: libraryName + '.js'
  },
  devtool: 'inline-source-map'
});

var PROD_CFG = _.extend({}, BASE_CFG, {
  plugins: [
    new ExtractTextPlugin({ filename: libraryName + '.min.css' }),
    new webpack.BannerPlugin(banner),
    new webpack.optimize.UglifyJsPlugin()
  ],
  output: {
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: 'dist',
    filename: libraryName + '.min.js'
  }
});

module.exports = [DEV_CFG, PROD_CFG];
