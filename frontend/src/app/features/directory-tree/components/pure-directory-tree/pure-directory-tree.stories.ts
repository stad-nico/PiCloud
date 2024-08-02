import { argsToTemplate, StoryObj, type Meta } from '@storybook/angular';
import { PureDirectoryTreeComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/pure-directory-tree.component';
import { Node } from 'src/app/features/directory-tree/state/directory-tree.state';

const meta: Meta<PureDirectoryTreeComponent> = {
	title: 'Features/Directory Tree/Pure Directory Tree',
	component: PureDirectoryTreeComponent,
	render: (args: any) => ({
		props: args,
		template: `<div style="resize:both;overflow:hidden"><pure-directory-tree ${argsToTemplate(args)}></pure-directory-tree></div>`,
	}),
};

export default meta;

const collapsedMetadata: Node = {
	name: 'root',
	hasChildren: true,
	isCollapsed: false,
	isSelected: false,
	id: 1,
	children: [
		{ name: 'example1', hasChildren: false, isSelected: false, id: 2 },
		{ name: 'example2', hasChildren: false, isSelected: false, id: 3 },
		{
			name: 'example3',
			hasChildren: true,
			isCollapsed: true,
			isSelected: false,
			id: 4,
			children: [
				{
					name: 'test',
					hasChildren: true,
					isCollapsed: true,
					isSelected: false,
					id: 5,
					children: [
						{
							name: 'test',
							isSelected: false,
							hasChildren: false,
							id: 6,
						},
					],
				},
			],
		},
	],
};

const expandedMetadata: Node = {
	name: 'root',
	hasChildren: true,
	isCollapsed: false,
	isSelected: false,
	id: 0,
	children: [
		{ name: 'example1', hasChildren: false, isSelected: false, id: 1 },
		{ name: 'example2', hasChildren: false, isSelected: false, id: 2 },
		{
			name: 'example3',
			hasChildren: true,
			isCollapsed: false,
			isSelected: false,
			id: 3,
			children: [
				{
					name: 'test',
					hasChildren: true,
					isCollapsed: false,
					isSelected: false,
					id: 4,
					children: [
						{
							name: 'test',
							hasChildren: false,
							isSelected: false,
							id: 5,
						},
					],
				},
			],
		},
	],
};

export const Default: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		metadata: collapsedMetadata,
	},
};

export const Expanded: StoryObj<PureDirectoryTreeComponent> = {
	args: {
		metadata: expandedMetadata,
	},
};
