export class DirectoryDeleteResponse {
	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}

	public static from(id: string) {
		return new DirectoryDeleteResponse(id);
	}
}
