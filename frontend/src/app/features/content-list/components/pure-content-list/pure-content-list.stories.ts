import { StoryObj, type Meta } from '@storybook/angular';
import {
	ContentType,
	Directory,
	File,
	PureContentListComponent,
	Type,
} from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';

const meta: Meta<PureContentListComponent> = {
	title: 'Components/Pure Content List',
	component: PureContentListComponent,
};

export default meta;

const exampleFile: File = {
	type: Type.File,
	name: 'element',
	mimeType: 'text/plain',
	size: 239,
	createdAt: new Date(Date.now()).toISOString(),
	updatedAt: new Date(Date.now()).toISOString(),
};

const exampleDirectory: Directory = {
	type: Type.Directory,
	name: 'element',
	size: 239,
	createdAt: new Date(Date.now()).toISOString(),
	updatedAt: new Date(Date.now()).toISOString(),
};

const defaultContent: Array<ContentType> = [exampleDirectory, exampleDirectory, exampleDirectory, exampleFile, exampleFile];

export const Default: StoryObj<PureContentListComponent> = {
	args: {
		content: defaultContent,
	},
};
