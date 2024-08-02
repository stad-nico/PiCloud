import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { withThemeByClassName } from '@storybook/addon-themes';
import { applicationConfig, type Preview } from '@storybook/angular';
import docJson from '../documentation.json';

setCompodocJson(docJson);

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		options: {
			storySort: {
				order: ['Colors', 'Shared', 'Features'],
			},
		},
	},
	tags: ['autodocs'],
	decorators: [
		withThemeByClassName({
			themes: {
				light: 'light-theme',
				dark: 'dark-theme',
				grey: 'grey-theme',
			},
			defaultTheme: 'light',
		}),
		applicationConfig({ providers: [provideAnimationsAsync()] }),
	],
};

export default preview;
