import { StoryObj, argsToTemplate, type Meta } from '@storybook/angular';
import { DirectoryListItemComponent } from 'src/app/shared/components/directory-list-item/directory-list-item.component';

const meta: Meta<DirectoryListItemComponent> = {
	title: 'Components/Directory List Item',
	component: DirectoryListItemComponent,
	render: (args: any) => ({
		template: `<div style="resize:both;overflow:hidden"><directory-list-item ${argsToTemplate(args)}></directory-list-item></div>`,
		props: args,
	}),
};

export default meta;

export const Default: StoryObj<DirectoryListItemComponent> = {
	args: {
		metadata: {
			name: 'example',
			size: 10382305,
			createdAt: new Date(Date.now()).toISOString(),
			updatedAt: new Date(Date.now()).toISOString(),
		},
	},
};
