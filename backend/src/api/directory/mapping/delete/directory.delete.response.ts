export class DirectoryDeleteResponse {
	readonly uuid: string;

	private constructor(uuid: string) {
		this.uuid = uuid;
	}

	public static from(uuid: string) {
		return new DirectoryDeleteResponse(uuid);
	}
}
