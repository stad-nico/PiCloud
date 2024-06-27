import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.ts'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@chromatic-com/storybook',
		'@storybook/addon-interactions',
		'@storybook/addon-viewport',
		'@storybook/addon-controls',
	],
	framework: {
		name: '@storybook/angular',
		options: {},
	},
};
export default config;
