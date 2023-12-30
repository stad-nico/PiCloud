export class DirectoryRenameDto {
	readonly sourcePath: string;

	readonly destPath: string;

	private constructor(sourcePath: string, destPath: string) {
		this.sourcePath = sourcePath;
		this.destPath = destPath;
	}
}
