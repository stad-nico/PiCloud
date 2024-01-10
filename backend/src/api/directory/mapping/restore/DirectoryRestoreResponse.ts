export class DirectoryRestoreResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(path: string) {
		return new DirectoryRestoreResponse(path);
	}
}
