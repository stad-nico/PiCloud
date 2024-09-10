import { StoryObj, argsToTemplate, type Meta } from '@storybook/angular';
import { DirectoryListItemComponent } from 'src/app/shared/components/directory-list-item/directory-list-item.component';

const meta: Meta<DirectoryListItemComponent> = {
	title: 'Shared/Directory List Item',
	component: DirectoryListItemComponent,
	render: (args: any) => ({
		template: `<div style="resize:both;overflow:hidden"><directory-list-item ${argsToTemplate(args)}></directory-list-item></div>`,
		props: args,
	}),
};

export default meta;

const defaultMetadata = {
	name: 'example',
	size: 10382305,
	createdAt: new Date(Date.now()).toISOString(),
	updatedAt: new Date(Date.now()).toISOString(),
};

export const Default: StoryObj<DirectoryListItemComponent> = {
	args: {
		metadata: defaultMetadata,
	},
};

export const Hovered: StoryObj<DirectoryListItemComponent> = {
	args: {
		metadata: defaultMetadata,
	},
	parameters: {
		pseudo: {
			hover: ['directory-list-item'],
		},
	},
};

export const Selected: StoryObj<DirectoryListItemComponent> = {
	args: {
		metadata: defaultMetadata,
		isSelected: true,
	},
};

export const SelectedHovered: StoryObj<DirectoryListItemComponent> = {
	args: {
		metadata: defaultMetadata,
		isSelected: true,
	},
	parameters: {
		pseudo: {
			hover: ['directory-list-item'],
		},
	},
};
