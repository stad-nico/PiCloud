import { StoryObj, type Meta } from '@storybook/angular';
import { DirectoryListItemComponent } from 'src/app/shared/components/directory-list-item/directory-list-item.component';

const meta: Meta<DirectoryListItemComponent> = {
	title: 'Directory List Item',
	component: DirectoryListItemComponent,
	parameters: {
		// layout: 'fullscreen',
	},
};

export default meta;

export const Default: StoryObj<DirectoryListItemComponent> = {
	args: {
		name: 'example',
		size: 10382305,
	},
};
