import { StoryObj, argsToTemplate, type Meta } from '@storybook/angular';
import { Direction, ExpandingMenuButtonComponent } from 'src/app/shared/components/expanding-menu-button/expanding-menu-button.component';

const meta: Meta<ExpandingMenuButtonComponent> = {
	title: 'Menu Button',
	component: ExpandingMenuButtonComponent,
	parameters: {
		layout: 'centered',
	},
	render: (args: ExpandingMenuButtonComponent) => ({
		props: args,
		template: `<expanding-menu-button ${argsToTemplate(args)}>
				   	<div style='background-color:green;border-radius:50%;aspect-ratio:1/1;width:45px;'></div>
					<div style='background-color:orange;border-radius:50%;aspect-ratio:1/1;width:45px;'></div>
					<div style='background-color:red;border-radius:50%;aspect-ratio:1/1;width:45px;'></div>
					</expanding-menu-button>`,
	}),
};

export default meta;

export const Up: StoryObj<ExpandingMenuButtonComponent> = {
	args: {
		direction: Direction.Up,
	},
};

export const Down: StoryObj<ExpandingMenuButtonComponent> = {
	args: {
		direction: Direction.Down,
	},
};

export const Left: StoryObj<ExpandingMenuButtonComponent> = {
	args: {
		direction: Direction.Left,
	},
};

export const Right: StoryObj<ExpandingMenuButtonComponent> = {
	args: {
		direction: Direction.Right,
	},
};
