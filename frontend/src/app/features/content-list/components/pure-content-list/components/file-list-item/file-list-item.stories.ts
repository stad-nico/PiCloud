import { StoryObj, argsToTemplate, type Meta } from '@storybook/angular';
import { FileListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/file-list-item/file-list-item.component';

const meta: Meta<FileListItemComponent> = {
	title: 'Features/Content List/File List Item',
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

export const Selected: StoryObj<FileListItemComponent> = {
	args: {
		metadata: defaultMetadata,
		selected: true,
	},
};
