import { argsToTemplate, StoryObj, type Meta } from '@storybook/angular';

import { LoadingSpinnerComponent, Thickness, Type } from 'src/app/shared/components/loading-spinner/loading-spinner.component';

const meta: Meta<LoadingSpinnerComponent> = {
	title: 'Shared/Loading Spinner',
	component: LoadingSpinnerComponent,
	parameters: {
		layout: 'fullscreen',
	},
	render: (args: any) => ({
		props: args,
		template: `<div style="resize:both;overflow:hidden"><loading-spinner ${argsToTemplate(args)}></loading-spinner></div>`,
	}),
};

export default meta;

export const Rounded: StoryObj<LoadingSpinnerComponent> = {
	args: {
		thickness: Thickness.Thick,
		type: Type.Rounded,
	},
};

export const Minimalistic: StoryObj<LoadingSpinnerComponent> = {
	args: {
		thickness: Thickness.Thin,
		type: Type.Minimalistic,
	},
};
