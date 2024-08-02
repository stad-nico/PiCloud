import { argsToTemplate, StoryObj, type Meta } from '@storybook/angular';
import { DirectoryTreeItemComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/components/directory-tree-item/directory-tree-item.component';

const meta: Meta<DirectoryTreeItemComponent> = {
	title: 'Features/Directory Tree/Directory Tree Item',
	component: DirectoryTreeItemComponent,
	render: (args: any) => ({
		props: args,
		template: `<div style="resize:both;overflow:hidden"><directory-tree-item ${argsToTemplate(args)}></directory-tree-item></div>`,
	}),
};

export default meta;

export const LeafDefault: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Leaf Default',
	args: {
		name: 'example',
		hasChildren: false,
		isSelected: false,
		id: 1,
	},
};

export const LeafSelected: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Leaf Selected',
	args: {
		name: 'example',
		hasChildren: false,
		isSelected: true,
		id: 1,
	},
};

export const NodeDefault: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Node Default',
	args: {
		name: 'example',
		hasChildren: true,
		isSelected: false,
		isCollapsed: true,
		id: 1,
		children: [
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 2,
			},
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 3,
			},
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 4,
			},
		],
	},
};

export const NodeSelected: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Node Selected',
	args: {
		name: 'example',
		hasChildren: true,
		isSelected: true,
		isCollapsed: true,
		id: 1,
		children: [
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 2,
			},
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 3,
			},
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 4,
			},
		],
	},
};

export const NodeExpanded: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Node Expanded',
	args: {
		name: 'example',
		hasChildren: true,
		isCollapsed: false,
		isSelected: false,
		id: 1,
		children: [
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 2,
			},
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 3,
			},
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 4,
			},
		],
	},
};

export const NodeExpandedSelected: StoryObj<DirectoryTreeItemComponent> = {
	name: 'Node Expanded Selected',
	args: {
		name: 'example',
		hasChildren: true,
		isCollapsed: false,
		isSelected: true,
		id: 1,
		children: [
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 2,
			},
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 3,
			},
			{
				name: 'example',
				hasChildren: false,
				isSelected: false,
				id: 4,
			},
		],
	},
};

// export const Selected: StoryObj<DirectoryTreeItemComponent> = {
// 	name: 'Empty Selected',
// 	args: {
// 		name: 'example',
// 		isSelected: true,
// 		children: [],
// 	},
// };

// export const CollapsedDefault: StoryObj<DirectoryTreeItemComponent> = {
// 	name: 'Collapsed Default',
// 	args: {
// 		name: 'example',
// 		children: [],
// 	},
// };

// export const CollapsedSelected: StoryObj<DirectoryTreeItemComponent> = {
// 	name: 'Collapsed Selected',
// 	args: {
// 		name: 'example',
// 		isSelected: true,
// 		children: [],
// 	},
// };

// export const ExpandedLoading: StoryObj<DirectoryTreeItemComponent> = {
// 	name: 'Expanded Loading',
// 	args: {
// 		name: 'example',
// 		isSelected: true,
// 		children: [],
// 		isCollapsed: false,
// 	},
// };

// export const ExpandedDefault: StoryObj<DirectoryTreeItemComponent> = {
// 	name: 'Expanded Default',
// 	args: {
// 		name: 'example',
// 		isSelected: true,
// 		children: [],
// 	},
// };

// export const ExpandedSelected: StoryObj<DirectoryTreeItemComponent> = {
// 	name: 'Expanded Selected',
// 	args: {
// 		name: 'example',
// 		isSelected: true,
// 		children: [],
// 	},
// };
