export class FileRestoreResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(path: string): FileRestoreResponse {
		return new FileRestoreResponse(path);
	}
}
