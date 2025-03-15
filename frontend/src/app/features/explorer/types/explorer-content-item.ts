export interface ExplorerContentItem {
	readonly id: string;

	readonly name: string;

	readonly size: number;

	readonly createdAt: string;

	readonly updatedAt: string;

	readonly isDirectory: boolean;
}
