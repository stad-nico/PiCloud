export class DirectoryCreateResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(path: string): DirectoryCreateResponse {
		return new DirectoryCreateResponse(path);
	}
}
