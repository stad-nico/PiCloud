export default class FolderStats {
	readonly name: string;
	readonly path: string;
	private isDirectory: boolean;

	constructor(name: string, path: string) {
		this.name = name;
		this.path = path;

		this.isDirectory = true;
	}
}
