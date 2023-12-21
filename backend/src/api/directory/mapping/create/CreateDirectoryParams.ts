export class CreateDirectoryParams {
	private readonly path: string;

	public constructor(path: string) {
		this.path = path;
	}

	public getPath() {
		return this.path;
	}
}
