export class FileDeleteResponse {
	readonly uuid: string;

	private constructor(uuid: string) {
		this.uuid = uuid;
	}

	public static from(uuid: string): FileDeleteResponse {
		return new FileDeleteResponse(uuid);
	}
}
