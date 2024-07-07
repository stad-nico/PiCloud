import { argsToTemplate, StoryObj, type Meta } from '@storybook/angular';
import { DirectoryTreeItemComponent } from 'src/app/features/directory-tree/components/directory-tree-item/directory-tree-item.component';

const meta: Meta<DirectoryTreeItemComponent> = {
	title: 'Features/Directory Tree/Directory Tree Item',
	component: DirectoryTreeItemComponent,
	render: (args: any) => ({
		props: args,
		template: `<div style="resize:both;overflow:hidden"><directory-tree-item ${argsToTemplate(args)}></directory-tree-item></div>`,
	}),
};

export default meta;

export const Default: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		name: 'example',
	},
};

export const Selected: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		name: 'example',
		selected: true,
	},
};
