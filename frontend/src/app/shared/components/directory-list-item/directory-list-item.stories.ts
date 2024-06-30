import { StoryObj, argsToTemplate, type Meta } from '@storybook/angular';
import { DirectoryListItemComponent } from 'src/app/shared/components/directory-list-item/directory-list-item.component';

const meta: Meta<DirectoryListItemComponent> = {
	title: 'Components/Directory List Item',
	component: DirectoryListItemComponent,
	parameters: {
		// layout: 'fullscreen',
	},
	render: (args: Partial<DirectoryListItemComponent>) => ({
		template: `<div style="resize:both;overflow:hidden"><directory-list-item ${argsToTemplate(args)}></directory-list-item></div>`,
		props: args,
	}),
};

export default meta;

export const Default: StoryObj<DirectoryListItemComponent> = {
	args: {
		name: 'example',
		size: 10382305,
	},
};
