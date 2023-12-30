export class DirectoryDeleteDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}
}
