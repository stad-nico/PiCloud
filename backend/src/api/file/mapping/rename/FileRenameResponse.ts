export class FileRenameResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(path: string): FileRenameResponse {
		return new FileRenameResponse(path);
	}
}
