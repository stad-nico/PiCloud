export class CreateDirectoryResponse {
	public readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public from() {
		return new CreateDirectoryResponse();
	}
}
