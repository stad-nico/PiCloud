import { StoryObj, argsToTemplate, type Meta } from '@storybook/angular';
import { FileListItemComponent } from 'src/app/shared/components/file-list-item/file-list-item.component';

const meta: Meta<FileListItemComponent> = {
	title: 'Components/File List Item',
	component: FileListItemComponent,
	render: (args: any) => ({
		template: `<div style="resize:both;overflow:hidden"><file-list-item ${argsToTemplate(args)}></file-list-item></div>`,
		props: args,
	}),
};

export default meta;

export const Default: StoryObj<FileListItemComponent> = {
	args: {
		metadata: {
			name: 'example',
			size: 10382305,
			createdAt: new Date(Date.now()).toISOString(),
			updatedAt: new Date(Date.now()).toISOString(),
			mimeType: 'text/plain',
		},
	},
};
