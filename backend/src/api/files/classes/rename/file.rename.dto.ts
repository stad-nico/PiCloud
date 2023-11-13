import { FileRenameBody, FileRenameParams } from 'src/api/files/classes/rename';

export class FileRenameDto {
	readonly sourcePath: string;

	readonly destinationPath: string;

	private constructor(sourcePath: string, destinationPath: string) {
		this.sourcePath = sourcePath;
		this.destinationPath = destinationPath;
	}

	public static from(fileRenameParams: FileRenameParams, fileRenameBody: FileRenameBody): FileRenameDto {
		return new FileRenameDto(fileRenameParams.path, fileRenameBody.newPath);
	}
}
