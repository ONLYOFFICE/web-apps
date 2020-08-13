const webpack = require('webpack');
const ora = require('ora');
const rm = require('rimraf');
const chalk = require('chalk');
const config = require('./webpack.config.js');

const env = process.env.NODE_ENV || 'development';
const target = process.env.TARGET || 'web';
const isCordova = target === 'cordova'

const spinner = ora(env === 'production' ? 'building for production...' : 'building development version...');
spinner.start();

rm(isCordova ? './cordova/www' : './www/', (removeErr) => {
  if (removeErr) throw removeErr;

  webpack(config, (err, stats) => {
    if (err) throw err;
    spinner.stop();

    process.stdout.write(`${stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false,
    })}\n\n`);

    if (stats.hasErrors()) {
      console.log(chalk.red('Build failed with errors.\n'));
      process.exit(1);
    }

    console.log(chalk.cyan('Build complete.\n'));
  });
});
