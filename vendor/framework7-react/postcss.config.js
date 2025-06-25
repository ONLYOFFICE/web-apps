import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss'

const config = (ctx) => ({
  plugins: {
    'postcss-preset-env': {},
    ...(ctx.env === 'production' ?
      purgeCSSPlugin({
        content: [
          './src/**/*.html',
          './src/**/*.jsx',
          './src/**/*.js',
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }) : {})
  },
});

export default config;
