export class DirectoryRenameBody {
	readonly newPath: string;

	private constructor(newPath: string) {
		this.newPath = newPath;
	}
}
