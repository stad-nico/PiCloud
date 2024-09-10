import { argsToTemplate, StoryObj, type Meta } from '@storybook/angular';
import { DirectoryTreeItemComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/components/directory-tree-item/directory-tree-item.component';

const meta: Meta<DirectoryTreeItemComponent> = {
	title: 'Features/Directory Tree/Components/Directory Tree Item',
	component: DirectoryTreeItemComponent,
	render: (args: any) => ({
		props: args,
		template: `<div style="resize:both;overflow:hidden"><directory-tree-item ${argsToTemplate(args)}></directory-tree-item></div>`,
	}),
};

export default meta;

const defaultLeaf = { id: 0, name: 'example', path: '/example/', isCollapsed: true, hasChildren: false, isSelected: false };

export const LeafDefault: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: defaultLeaf,
		tree: {},
	},
};

export const LeafHovered: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: defaultLeaf,
		tree: {},
	},
	parameters: {
		pseudo: {
			hover: true,
		},
	},
};

export const LeafSelected: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: { ...defaultLeaf, isSelected: true },
		tree: {},
	},
};

export const LeafSelectedHovered: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: { ...defaultLeaf, isSelected: true },
		tree: {},
	},
	parameters: {
		pseudo: {
			hover: true,
		},
	},
};

const defaultNode = { id: 0, name: 'example', path: '/example/', isCollapsed: true, hasChildren: true, isSelected: false };

export const NodeCollapsed: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: defaultNode,
		tree: {},
	},
};

export const NodeCollapsedHovered: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: defaultNode,
		tree: {},
	},
	parameters: {
		pseudo: {
			hover: ['directory-tree-item > header'],
		},
	},
};

export const NodeExpanded: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: { ...defaultNode, isCollapsed: false },
		tree: {
			'/example/': [
				{ id: 1, name: 'child', path: '/child/', hasChildren: false, isCollapsed: true, isSelected: false },
				{
					id: 2,
					name: 'child with long name and children',
					path: '/child with long name and children/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
		},
	},
};

export const NodeExpandedHovered: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: { ...defaultNode, isCollapsed: false },
		tree: {
			'/example/': [
				{ id: 1, name: 'child', path: '/child/', hasChildren: false, isCollapsed: true, isSelected: false },
				{
					id: 2,
					name: 'child with long name and children',
					path: '/child with long name and children/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
		},
	},
	parameters: {
		pseudo: {
			hover: ['div > directory-tree-item > header'],
		},
	},
};

export const NodeExpandedSelected: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: { ...defaultNode, isCollapsed: false, isSelected: true },
		tree: {
			'/example/': [
				{ id: 1, name: 'child', path: '/child/', hasChildren: false, isCollapsed: true, isSelected: false },
				{
					id: 2,
					name: 'child with long name and children',
					path: '/child with long name and children/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
		},
	},
};

export const NodeExpandedSelectedHovered: StoryObj<DirectoryTreeItemComponent> = {
	args: {
		node: { ...defaultNode, isCollapsed: false, isSelected: true },
		tree: {
			'/example/': [
				{ id: 1, name: 'child', path: '/child/', hasChildren: false, isCollapsed: true, isSelected: false },
				{
					id: 2,
					name: 'child with long name and children',
					path: '/child with long name and children/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
		},
	},
	parameters: {
		pseudo: {
			hover: ['div > directory-tree-item > header'],
		},
	},
};
