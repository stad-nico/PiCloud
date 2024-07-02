import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.ts', '../stories/**/*.mdx', '../stories/**/*.stories.ts'],
	addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@chromatic-com/storybook',
        '@storybook/addon-interactions',
        '@storybook/addon-viewport',
        '@storybook/addon-controls',
        '@storybook/addon-a11y',
        '@storybook/addon-themes',
        '@storybook/addon-docs',
        '@storybook/addon-styling-webpack',
        ({
          name: "@storybook/addon-styling-webpack",

          options: {
            rules: [{
          test: /\.css$/,
          sideEffects: true,
          use: [
              require.resolve("style-loader"),
              {
                  loader: require.resolve("css-loader"),
                  options: {
                      // Want to add more CSS Modules options? Read more here: https://github.com/webpack-contrib/css-loader#modules
        modules: {
        auto: true,
        },
                      
                  },
              },
          ],
        },],
          }
        })
    ],
	framework: {
		name: '@storybook/angular',
		options: {},
	},
};
export default config;
