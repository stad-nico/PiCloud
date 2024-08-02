import { StoryObj, type Meta } from '@storybook/angular';
import { SelectableFileListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-file-list-item/selectable-file-list-item.component';

const meta: Meta<SelectableFileListItemComponent> = {
	title: 'Features/Content List/Selectable File List Item',
	component: SelectableFileListItemComponent,
};

export default meta;

const defaultMetadata = {
	name: 'example',
	size: 10382305,
	mimeType: 'text/plain',
	createdAt: new Date(Date.now()).toISOString(),
	updatedAt: new Date(Date.now()).toISOString(),
};

export const Default: StoryObj<SelectableFileListItemComponent> = {
	args: {
		metadata: defaultMetadata,
	},
};

export const Unselected: StoryObj<SelectableFileListItemComponent> = {
	args: {
		isSelectable: true,
		isSelected: false,
		metadata: defaultMetadata,
	},
};

export const Selected: StoryObj<SelectableFileListItemComponent> = {
	args: {
		isSelectable: true,
		isSelected: true,
		metadata: defaultMetadata,
	},
};
