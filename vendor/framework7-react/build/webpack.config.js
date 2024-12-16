import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolvePath(dir) {
  return path.join(__dirname, '..', dir);
}

const env = process.env.NODE_ENV || 'development';
const target = process.env.TARGET || 'web';
const editor = process.env.TARGET_EDITOR === 'cell' ? 'spreadsheeteditor' :
                process.env.TARGET_EDITOR === 'slide' ? 'presentationeditor' :
                process.env.TARGET_EDITOR === 'visio' ? 'visioeditor' : 'documenteditor';
const targetPatch = process.env.TARGET_EDITOR || 'word';
const addonPath = process.env.ADDON_ENV || 'path';

const config = {
  mode: env,
  entry: {
    app: `../../apps/${editor}/mobile/src/app.js`,
  },
  output: {
    path: resolvePath(`../../apps/${editor}/mobile`),
    filename: 'dist/js/[name].js',
    chunkFilename: 'dist/js/[name].js',
    publicPath: '',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': resolvePath(`../../apps/${editor}/mobile/src`),
      '@common': resolvePath('../../apps/common/mobile'),
    },
    modules: [path.resolve(__dirname, '..', 'node_modules'), 'node_modules'],
  },
  watch: env === 'development',
  watchOptions: {
    aggregateTimeout: 600,
    poll: 1000,
  },
  externals: {
    jquery: 'jQuery'
  },
  devtool: env === 'production' ? 'source-map' : 'source-map',
  optimization: {
    // splitChunks: {
    //   chunks: 'all',
    //   minSize: 20000,
    //   maxSize: 244000,
    //   cacheGroups: {
    //     vendor: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name: 'vendors',
    //       chunks: 'all',
    //       enforce: true,
    //     },
    //     common: {
    //       name: 'common',
    //       minChunks: 2,
    //       chunks: 'all',
    //       reuseExistingChunk: true,
    //       enforce: true,
    //     }
    //   }
    // },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: env === 'production',
          },
        },
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', {
            discardComments: { removeAll: true },
            colormin: false,
          }],
        },
      }),
    ],
    moduleIds: 'deterministic',
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
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
          resolvePath('../../../web-apps-mobile/word'),
          resolvePath('../../../web-apps-mobile/slide'),
          resolvePath('../../../web-apps-mobile/visio'),
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
              postcssOptions: {
                config: path.resolve(__dirname, '..'),
              }
            }
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
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                path: path.resolve(__dirname, '..'),
              }
            }
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                globalVars: {
                  "common-image-path": env === 'production' ? `../../../${editor}/mobile/resources/img` : '../../common/mobile/resources/img',
                  "app-image-path": env === 'production' ? '../resources/img' : './resources/img',
                }
              }
            }
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'images/[name].[hash].[ext]',
              outputPath: `../../../apps/${editor}/mobile/dist`,
            },
          }
        ]
      },
      {
        test: /\.svg$/,
        use: {
          loader: "svg-sprite-loader",
        }
      },      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash].[ext]',
          outputPath: `../../../apps/${editor}/mobile/dist/assets`,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.TARGET': JSON.stringify(target),
      __PRODUCT_VERSION__: JSON.stringify(process.env.PRODUCT_VERSION ? `${process.env.PRODUCT_VERSION}.${process.env.BUILD_NUMBER}` : '6.2.0.123d'),
      __PUBLISHER_ADDRESS__: JSON.stringify(process.env.PUBLISHER_ADDRESS || '20A-12 Ernesta Birznieka-Upisha street, Riga, Latvia, EU, LV-1050'),
      __SUPPORT_EMAIL__: JSON.stringify(process.env.SUPPORT_EMAIL || 'support@onlyoffice.com'),
      __SUPPORT_URL__: JSON.stringify(process.env.SUPPORT_URL || 'https://support.onlyoffice.com'),
      __PUBLISHER_PHONE__: JSON.stringify(process.env.PUBLISHER_PHONE || '+371 633-99867'),
      __PUBLISHER_URL__: JSON.stringify(process.env.PUBLISHER_URL || 'https://www.onlyoffice.com'),
      __PUBLISHER_NAME__: JSON.stringify(process.env.PUBLISHER_NAME || 'Ascensio System SIA'),
      __APP_TITLE_TEXT__: JSON.stringify(process.env.APP_TITLE_TEXT ? process.env.APP_TITLE_TEXT : 'ONLYOFFICE'),
      __COMPANY_NAME__: JSON.stringify(process.env.COMPANY_NAME ? process.env.COMPANY_NAME : 'ONLYOFFICE'),
      __HELP_URL__: JSON.stringify(process.env.HELP_URL || 'https://helpcenter.onlyoffice.com'),
      __SALES_EMAIL__: JSON.stringify(process.env.SALES_EMAIL || 'sales@onlyoffice.com'),
    }),
    new webpack.BannerPlugin(`\n* Version: ${process.env.PRODUCT_VERSION} (build: ${process.env.BUILD_NUMBER})\n`),

    ...(env === 'production' ? [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', {
            discardComments: { removeAll: true },
          }],
        },
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
    ] : [
      new webpack.HotModuleReplacementPlugin(),
    ]),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
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
        checkerscript: fs.readFileSync(`../../apps/common/checkExtendedPDF.js`),
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
          from: resolvePath('node_modules/framework7/framework7-bundle.css'),
          to: `../../${editor}/mobile/css/framework7.css`,
        },
        {
          from: resolvePath('node_modules/framework7/framework7-bundle-rtl.css'),
          to: `../../${editor}/mobile/css/framework7-rtl.css`,
        },
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
      resource => (env === 'development' || /web-apps-mobile/.test(process.env.addon)) &&
        fs.existsSync(`../../../web-apps-mobile/${targetPatch}/patch.jsx`) ?
        resource.request = `../../../../../../web-apps-mobile/${targetPatch}/patch.jsx` : resource
    ),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: env === 'development' ? 'server' : 'disabled',
    // }),
  ],
};

export default config;