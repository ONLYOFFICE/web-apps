const config = (ctx) => ({
  plugins: {
    'postcss-preset-env': {},
    ...(ctx.env === 'production' ? {
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/**/*.html',
          './src/**/*.jsx',
          './src/**/*.js',
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      }
    } : {})
  },
});

export default config;
