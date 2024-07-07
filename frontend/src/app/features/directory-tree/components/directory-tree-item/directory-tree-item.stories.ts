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
	name: 'Default',
	args: {
		name: 'example',
		hasChildren: false,
	},
};

export const Selected: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Selected',
	args: {
		name: 'example',
		selected: true,
		hasChildren: false,
	},
};

export const CollapsedDefault: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Collapsed Default',
	args: {
		name: 'example',
		hasChildren: true,
	},
};

export const CollapsedSelected: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Collapsed Selected',
	args: {
		name: 'example',
		selected: true,
		hasChildren: true,
	},
};

export const ExpandedLoading: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Expanded Loading',
	args: {
		name: 'example',
		selected: true,
		hasChildren: true,
	},
};

export const ExpandedDefault: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Expanded Default',
	args: {
		name: 'example',
		selected: true,
		hasChildren: true,
	},
};

export const ExpandedSelected: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Expanded Selected',
	args: {
		name: 'example',
		selected: true,
		hasChildren: true,
	},
};
