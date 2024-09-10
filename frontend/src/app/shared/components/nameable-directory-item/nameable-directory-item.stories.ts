import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { NameableDirectoryItemComponent } from 'src/app/shared/components/nameable-directory-item/nameable-directory-item.component';

const meta: Meta<NameableDirectoryItemComponent> = {
	title: 'Shared/Nameable Directory Item',
	component: NameableDirectoryItemComponent,
	render: (args: any) => ({
		template: `<div style="resize:both;overflow:hidden"><nameable-directory-item ${argsToTemplate(args)}></nameable-directory-item></div>`,
		props: args,
	}),
};

export default meta;

export const Default: StoryObj<NameableDirectoryItemComponent> = {
	args: {},
};
