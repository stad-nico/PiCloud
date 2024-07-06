import { StoryObj, type Meta } from '@storybook/angular';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';

const meta: Meta<CheckboxComponent> = {
	title: 'Shared/Checkbox',
	component: CheckboxComponent,
};

export default meta;

export const Default: StoryObj<CheckboxComponent> = {};
