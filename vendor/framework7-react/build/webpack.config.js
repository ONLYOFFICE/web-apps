const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const path = require('path');

function resolvePath(dir) {
  return path.join(__dirname, '..', dir);
}

const env = process.env.NODE_ENV || 'development';
const target = process.env.TARGET || 'web';
const editor = process.env.TARGET_EDITOR == 'cell' ? 'spreadsheeteditor' :
                    process.env.TARGET_EDITOR == 'slide' ? 'presentationeditor' : 'documenteditor';

module.exports = {
  mode: env,
  entry: {
    app: `../../apps/${editor}/mobile/src/app.js`,
  },
  output: {
    path: resolvePath(`../../apps/${editor}/mobile`), // path above depends on it
    filename: 'dist/js/[name].js', // in such form will be injected in index.html
    chunkFilename: 'dist/js/[name].js',
    publicPath: '',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': resolvePath(`../../apps/${editor}/mobile/src`),
    },
    modules: [path.resolve(__dirname, '..', 'node_modules'), 'node_modules'],
  },
  watch: true,
  watchOptions: {
      aggregateTimeout: 600,
      poll: 1000,
  },
  externals: {
      jquery: 'jQuery'
  },

  devtool: env === 'production' ? 'source-map' : 'source-map',
  optimization: {
    minimizer: [new TerserPlugin({
      sourceMap: true,
    })],
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js|jsx)$/,
        use: {
            loader: 'babel-loader',
            options: {
                
            }
        },
        include: [
          resolvePath(`../../apps/${editor}/mobile/src`),
          resolvePath('../../apps/common/mobile/lib'),
          resolvePath('node_modules/framework7'),

          resolvePath('node_modules/framework7-react'),

          resolvePath('node_modules/template7'),
          resolvePath('node_modules/dom7'),
          resolvePath('node_modules/ssr-window'),
        ],
      },



      {
        test: /\.css$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    config: {
                        path: path.resolve(__dirname, '..'),
                    }
                },
            },
        ],
      },
      {
        test: /\.less$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    config: {
                        path: path.resolve(__dirname, '..'),
                    }
                },
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  javascriptEnabled: true
                }
              }
            },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'images/[name].[ext]',
          outputPath: `../../../apps/${editor}/mobile/dist`,

        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]',
          outputPath: `../../../apps/${editor}/mobile/dist/assets`,

        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.TARGET': JSON.stringify(target),
    }),

    ...(env === 'production' ? [
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
          map: { inline: false },
        },
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
    ] : [
      // Development only plugins
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
    ]),
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: `../../../apps/${editor}/mobile/index.html`,
      template: `../../apps/${editor}/mobile/src/index_dev.html`,
      inject: true,
      minify: env === 'production' ? {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      } : false,
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          noErrorOnMissing: true,
          from: resolvePath('src/static'),
          to: resolvePath('www/static'),
        },
        {
          noErrorOnMissing: true,
          from: resolvePath('src/manifest.json'),
          to: resolvePath('www/manifest.json'),
        },
      ],
    }),
  ],
};