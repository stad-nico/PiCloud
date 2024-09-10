import { argsToTemplate, StoryObj, type Meta } from '@storybook/angular';
import { PureDirectoryTreeComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/pure-directory-tree.component';

const meta: Meta<PureDirectoryTreeComponent> = {
	title: 'Features/Directory Tree/Pure Directory Tree',
	component: PureDirectoryTreeComponent,
	render: (args: any) => ({
		props: args,
		template: `<div style="resize:both;overflow:hidden"><pure-directory-tree ${argsToTemplate(args)}></pure-directory-tree></div>`,
	}),
	parameters: {
		backgrounds: {
			default: 'dark',
		},
	},
};

export default meta;

export const Default: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: true, isCollapsed: false, isSelected: false },
		tree: {
			'/root/': [
				{
					id: 1,
					name: 'child 1',
					path: '/root/child 1/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 2,
					name: 'child 2',
					path: '/root/child 2/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 3,
					name: 'child 3',
					path: '/root/child 3/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 4,
					name: 'nested child 1',
					path: '/root/nested child 1/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 5,
					name: 'nested child 2',
					path: '/root/nested child 2/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 6,
					name: 'nested child 3',
					path: '/root/nested child 3/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
		},
	},
};

export const Empty: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: false, isCollapsed: false, isSelected: false },
		tree: {},
	},
};

export const Expanded: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: true, isCollapsed: false, isSelected: false },
		tree: {
			'/root/': [
				{
					id: 1,
					name: 'child 1',
					path: '/root/child 1/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 2,
					name: 'child 2',
					path: '/root/child 2/',
					hasChildren: false,
					isCollapsed: false,
					isSelected: false,
				},
				{
					id: 3,
					name: 'child 3',
					path: '/root/child 3/',
					hasChildren: false,
					isCollapsed: false,
					isSelected: false,
				},
				{
					id: 4,
					name: 'nested child 1',
					path: '/root/nested child 1/',
					hasChildren: true,
					isCollapsed: false,
					isSelected: false,
				},
				{
					id: 5,
					name: 'nested child 2',
					path: '/root/nested child 2/',
					hasChildren: true,
					isCollapsed: false,
					isSelected: false,
				},
				{
					id: 6,
					name: 'nested child 3',
					path: '/root/nested child 3/',
					hasChildren: true,
					isCollapsed: false,
					isSelected: false,
				},
			],
			'/root/nested child 1/': [{ id: 7, name: 'child', path: '/root/nested child 1/child/', isSelected: false, isCollapsed: true, hasChildren: false }],
			'/root/nested child 2/': [{ id: 7, name: 'child', path: '/root/nested child 2/child/', isSelected: false, isCollapsed: true, hasChildren: false }],
			'/root/nested child 3/': [{ id: 7, name: 'child', path: '/root/nested child 3/child/', isSelected: false, isCollapsed: true, hasChildren: false }],
		},
	},
};

export const LeafHovered: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: true, isCollapsed: false, isSelected: false },
		tree: {
			'/root/': [
				{
					id: 1,
					name: 'child 1',
					path: '/root/child 1/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 2,
					name: 'child 2',
					path: '/root/child 2/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 3,
					name: 'child 3',
					path: '/root/child 3/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 4,
					name: 'nested child 1',
					path: '/root/nested child 1/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 5,
					name: 'nested child 2',
					path: '/root/nested child 2/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 6,
					name: 'nested child 3',
					path: '/root/nested child 3/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
		},
	},
	parameters: {
		pseudo: {
			hover: ['pure-directory-tree > directory-tree-item > directory-tree-item:nth-child(2) > header'],
		},
	},
};

export const LeafSelected: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: true, isCollapsed: false, isSelected: false },
		tree: {
			'/root/': [
				{
					id: 1,
					name: 'child 1',
					path: '/root/child 1/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 2,
					name: 'child 2',
					path: '/root/child 2/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: true,
				},
				{
					id: 3,
					name: 'child 3',
					path: '/root/child 3/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 4,
					name: 'nested child 1',
					path: '/root/nested child 1/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 5,
					name: 'nested child 2',
					path: '/root/nested child 2/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 6,
					name: 'nested child 3',
					path: '/root/nested child 3/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
		},
	},
};

export const LeafSelectedHovered: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: true, isCollapsed: false, isSelected: false },
		tree: {
			'/root/': [
				{
					id: 1,
					name: 'child 1',
					path: '/root/child 1/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 2,
					name: 'child 2',
					path: '/root/child 2/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: true,
				},
				{
					id: 3,
					name: 'child 3',
					path: '/root/child 3/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 4,
					name: 'nested child 1',
					path: '/root/nested child 1/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 5,
					name: 'nested child 2',
					path: '/root/nested child 2/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 6,
					name: 'nested child 3',
					path: '/root/nested child 3/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
		},
	},
	parameters: {
		pseudo: {
			hover: ['pure-directory-tree > directory-tree-item > directory-tree-item:nth-child(2) > header'],
		},
	},
};

export const NodeHovered: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: true, isCollapsed: false, isSelected: false },
		tree: {
			'/root/': [
				{
					id: 1,
					name: 'child 1',
					path: '/root/child 1/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 2,
					name: 'child 2',
					path: '/root/child 2/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 3,
					name: 'child 3',
					path: '/root/child 3/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 4,
					name: 'nested child 1',
					path: '/root/nested child 1/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 5,
					name: 'nested child 2',
					path: '/root/nested child 2/',
					hasChildren: true,
					isCollapsed: false,
					isSelected: false,
				},
				{
					id: 6,
					name: 'nested child 3',
					path: '/root/nested child 3/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
			'/root/nested child 2/': [{ id: 7, name: 'child', path: '/root/nested child 2/child/', isSelected: false, isCollapsed: true, hasChildren: false }],
		},
	},
	parameters: {
		pseudo: {
			hover: ['pure-directory-tree > directory-tree-item > directory-tree-item:nth-child(5) > header'],
		},
	},
};

export const NodeSelected: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: true, isCollapsed: false, isSelected: false },
		tree: {
			'/root/': [
				{
					id: 1,
					name: 'child 1',
					path: '/root/child 1/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 2,
					name: 'child 2',
					path: '/root/child 2/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 3,
					name: 'child 3',
					path: '/root/child 3/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 4,
					name: 'nested child 1',
					path: '/root/nested child 1/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 5,
					name: 'nested child 2',
					path: '/root/nested child 2/',
					hasChildren: true,
					isCollapsed: false,
					isSelected: true,
				},
				{
					id: 6,
					name: 'nested child 3',
					path: '/root/nested child 3/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
			'/root/nested child 2/': [{ id: 7, name: 'child', path: '/root/nested child 2/child/', isSelected: false, isCollapsed: true, hasChildren: false }],
		},
	},
};

export const NodeSelectedHovered: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		root: { id: 0, name: 'root', path: '/root/', hasChildren: true, isCollapsed: false, isSelected: false },
		tree: {
			'/root/': [
				{
					id: 1,
					name: 'child 1',
					path: '/root/child 1/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 2,
					name: 'child 2',
					path: '/root/child 2/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 3,
					name: 'child 3',
					path: '/root/child 3/',
					hasChildren: false,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 4,
					name: 'nested child 1',
					path: '/root/nested child 1/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
				{
					id: 5,
					name: 'nested child 2',
					path: '/root/nested child 2/',
					hasChildren: true,
					isCollapsed: false,
					isSelected: true,
				},
				{
					id: 6,
					name: 'nested child 3',
					path: '/root/nested child 3/',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
				},
			],
			'/root/nested child 2/': [{ id: 7, name: 'child', path: '/root/nested child 2/child/', isSelected: false, isCollapsed: true, hasChildren: false }],
		},
	},
	parameters: {
		pseudo: {
			hover: ['pure-directory-tree > directory-tree-item > directory-tree-item:nth-child(5) > header'],
		},
	},
};
