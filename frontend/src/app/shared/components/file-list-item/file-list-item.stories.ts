import { StoryObj, argsToTemplate, type Meta } from '@storybook/angular';
import { FileListItemComponent } from 'src/app/shared/components/file-list-item/file-list-item.component';

const meta: Meta<FileListItemComponent> = {
	title: 'Shared/File List Item',
	component: FileListItemComponent,
	render: (args: any) => ({
		template: `<div style="resize:both;overflow:hidden"><file-list-item ${argsToTemplate(args)}></file-list-item></div>`,
		props: args,
	}),
};

export default meta;

const defaultMetadata = {
	name: 'example',
	size: 10382305,
	createdAt: new Date(Date.now()).toISOString(),
	updatedAt: new Date(Date.now()).toISOString(),
	mimeType: 'text/plain',
};

export const Default: StoryObj<FileListItemComponent> = {
	args: {
		metadata: defaultMetadata,
	},
};

export const Hovered: StoryObj<FileListItemComponent> = {
	args: {
		metadata: defaultMetadata,
	},
	parameters: {
		pseudo: {
			hover: ['file-list-item'],
		},
	},
};

export const Selected: StoryObj<FileListItemComponent> = {
	args: {
		metadata: defaultMetadata,
		isSelected: true,
	},
};

export const SelectedHovered: StoryObj<FileListItemComponent> = {
	args: {
		metadata: defaultMetadata,
		isSelected: true,
	},
	parameters: {
		pseudo: {
			hover: ['file-list-item'],
		},
	},
	name: 'Selected Hovered',
};
