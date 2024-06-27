import { StoryObj, type Meta } from '@storybook/angular';

import { LoadingSpinnerComponent, Thickness, Type } from 'src/app/shared/components/loading-spinner/loading-spinner.component';

const meta: Meta<LoadingSpinnerComponent> = {
	title: 'Loading Spinner',
	component: LoadingSpinnerComponent,
	parameters: {
		layout: 'fullscreen',
	},
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
