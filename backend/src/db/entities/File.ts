export type File = {
	uuid: string;
	name: string;
	parent: string;
	size: number;
	mimeType: string;
	isRecycled: boolean;
	created: Date;
	updated: Date;
};
