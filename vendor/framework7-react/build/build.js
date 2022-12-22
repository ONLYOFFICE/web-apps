import webpack from 'webpack';
import rm from 'rimraf';
import config from "./webpack.config.js";

const env = process.env.NODE_ENV || 'development';
const target = process.env.TARGET || 'web';

Promise.all([
    import('ora'),
    import('chalk')
]).then( ([oramodule, chalkmodule]) => {
    const { default: ora } = oramodule,
        { default: chalk } = chalkmodule;

    const spinner = ora(env === 'production' ? 'building for production...' : 'building development version...').start();

    rm('./www/', (removeErr) => {
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
} ).catch(error => {
    console.log('error in promise', error)
});
