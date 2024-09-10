import { StoryObj, type Meta } from '@storybook/angular';
import { SelectableDirectoryListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-directory-list-item/selectable-directory-list-item.component';

const meta: Meta<SelectableDirectoryListItemComponent> = {
	title: 'Features/Content List/Components/Selectable Directory List Item',
	component: SelectableDirectoryListItemComponent,
};

export default meta;

const defaultMetadata = {
	name: 'example',
	size: 10382305,
	createdAt: new Date(Date.now()).toISOString(),
	updatedAt: new Date(Date.now()).toISOString(),
};

export const Default: StoryObj<SelectableDirectoryListItemComponent> = {
	args: {
		metadata: defaultMetadata,
	},
};

export const Unselected: StoryObj<SelectableDirectoryListItemComponent> = {
	args: {
		isSelectable: true,
		isSelected: false,
		metadata: defaultMetadata,
	},
};

export const Selected: StoryObj<SelectableDirectoryListItemComponent> = {
	args: {
		isSelectable: true,
		isSelected: true,
		metadata: defaultMetadata,
	},
};
