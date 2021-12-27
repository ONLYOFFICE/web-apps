const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const fs = require('fs')

const path = require('path');

function resolvePath(dir) {
  return path.join(__dirname, '..', dir);
}

const env = process.env.NODE_ENV || 'development';
const target = process.env.TARGET || 'web';
const editor = process.env.TARGET_EDITOR == 'cell' ? 'spreadsheeteditor' :
                    process.env.TARGET_EDITOR == 'slide' ? 'presentationeditor' : 'documenteditor';
const targetPatch = process.env.TARGET_EDITOR || 'word';
const addonPath = process.env.ADDON_ENV || 'path';

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
  watch: env == 'development',
  watchOptions: {
      aggregateTimeout: 600,
      poll: 1000,
  },
  externals: {
      jquery: 'jQuery'
  },

  devtool: env === 'production' ? false/*'source-map'*/ : 'source-map', // TODO: turn off debugger source map before release
  optimization: {
    minimizer: [new TerserPlugin({
    })],
    moduleIds: 'named',
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

          //resolvePath(`${addonPath}`),
          resolvePath('../../../web-apps-mobile/word'),
          resolvePath('../../../web-apps-mobile/slide'),
          resolvePath('../../../web-apps-mobile/cell')
        ],
      },



      {
        test: /\.css$/,
        exclude: [/skeleton\.css$/i],
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
            'css-loader?url=false',
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
                  javascriptEnabled: true,
                  globalVars: {
                      "common-image-header-path": env === 'production' ? `../../../${editor}/mobile/resources/img/header` : '../../common/mobile/resources/img/header',
                      "common-image-about-path": env === 'production' ? `../../../${editor}/mobile/resources/img/about` : '../../common/main/resources/img/about',
                      "app-image-path": env === 'production' ? '../resources/img' : './resources/img',
                  }
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
      __PRODUCT_VERSION__: JSON.stringify(process.env.PRODUCT_VERSION ? process.env.PRODUCT_VERSION : '6.2.0d'),
      __PUBLISHER_ADDRESS__: JSON.stringify(process.env.PUBLISHER_ADDRESS || '20A-12 Ernesta Birznieka-Upisha street, Riga, Latvia, EU, LV-1050'),
      __SUPPORT_EMAIL__: JSON.stringify(process.env.SUPPORT_EMAIL || 'support@onlyoffice.com'),
      __PUBLISHER_PHONE__: JSON.stringify(process.env.PUBLISHER_PHONE || '+371 633-99867'),
      __PUBLISHER_URL__: JSON.stringify(process.env.PUBLISHER_URL || 'https://www.onlyoffice.com'),
      __PUBLISHER_NAME__: JSON.stringify(process.env.PUBLISHER_NAME || 'Ascensio System SIA'),
      __APP_TITLE_TEXT__: JSON.stringify(process.env.APP_TITLE_TEXT ? process.env.APP_TITLE_TEXT : 'ONLYOFFICE'),
      __COMPANY_NAME__: JSON.stringify(process.env.COMPANY_NAME ? process.env.COMPANY_NAME : 'ONLYOFFICE'),
      __HELP_URL__: JSON.stringify(process.env.HELP_URL || 'https://helpcenter.onlyoffice.com'),
      __SALES_EMAIL__: JSON.stringify(process.env.__SALES_EMAIL__ || 'sales@onlyoffice.com'),
    }),
    new webpack.BannerPlugin(`\n* Version: ${process.env.PRODUCT_VERSION} (build: ${process.env.BUILD_NUMBER})\n`),

    ...(env === 'production' ? [
      new CssMinimizerPlugin({
        minimizerOptions: {
            processorOptions: {
                safe: true,
                map: { inline: false },
            },
        },
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
    ] : [
      // Development only plugins
      new webpack.HotModuleReplacementPlugin(),
      // new webpack.NamedModulesPlugin(),
    ]),
    // new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
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
      skeleton: {
          stylesheet: env === 'development' ? undefined : fs.readFileSync(`../../apps/common/mobile/resources/css/skeleton.css`),
          htmlscript: fs.readFileSync(`../../apps/common/mobile/utils/htmlutils.js`),
      },
      system: {
          env: {
              defaultLang: JSON.stringify(process.env.DEFAULT_LANG || "en"),
          }
      },
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
    new webpack.NormalModuleReplacementPlugin(
        /\.{2}\/lib\/patch/,
        resource => fs.existsSync(`../../../web-apps-mobile/${targetPatch}/patch.jsx`) ?
                        resource.request = `../../../../../../web-apps-mobile/${targetPatch}/patch.jsx` : resource
        //resource => fs.existsSync(`${addonPath}/patch.jsx`) ?
                        //resource.request = `../../../${addonPath}/patch.jsx` : resource
    ),
  ],
};