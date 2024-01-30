export class FileDeleteResponse {
	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}

	public static from(id: string): FileDeleteResponse {
		return new FileDeleteResponse(id);
	}
}
