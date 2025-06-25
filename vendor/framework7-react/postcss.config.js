import postcssPresetEnv from 'postcss-preset-env';
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';

const config = (ctx) => ({
	plugins: [
		postcssPresetEnv(),
		ctx.env === 'production' ? purgeCSSPlugin({
			content: [
				'./src/**/*.html',
				'./src/**/*.jsx',
				'./src/**/*.js',
			],
			defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
		}) : null,
	].filter(Boolean),
});

export default config;
