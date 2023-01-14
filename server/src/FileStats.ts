export default class FileStats {
	readonly name: string;
	readonly size: number;
	readonly path: string;

	private isDirectory: boolean;

	constructor(name: string, size: number, path: string) {
		this.name = name;
		this.size = size;
		this.path = path;

		this.isDirectory = false;
	}
}
