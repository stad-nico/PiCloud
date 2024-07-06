import { StoryObj, type Meta } from '@storybook/angular';
import { SelectableListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-list-item/selectable-list-item.component';

const meta: Meta<SelectableListItemComponent> = {
	title: 'Features/Content List/Selectable List Item',
	component: SelectableListItemComponent,
	render: (args: any) => ({
		props: args,
		template: `<selectable-list-item><p>Example Content</p></selectable-list-item>`,
	}),
};

export default meta;

export const Default: StoryObj<SelectableListItemComponent> = {
	args: {
		isSelectable: true,
	},
};
