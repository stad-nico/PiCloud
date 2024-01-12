import { FileRenameBody, FileRenameParams } from 'src/api/file/mapping/rename';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class FileRenameDto {
	readonly sourcePath: string;

	readonly destinationPath: string;

	private constructor(sourcePath: string, destinationPath: string) {
		this.sourcePath = sourcePath;
		this.destinationPath = destinationPath;
	}

	public static from(fileRenameParams: FileRenameParams, fileRenameBody: FileRenameBody): FileRenameDto {
		const normalizedSourcePath = PathUtils.normalize(fileRenameParams.path);

		if (!PathUtils.isValidFilePath(normalizedSourcePath)) {
			throw new ValidationError(`path ${fileRenameParams.path} is not a valid file path`);
		}

		const normalizedDestPath = PathUtils.normalize(fileRenameBody.newPath);

		if (!PathUtils.isValidFilePath(normalizedDestPath)) {
			throw new ValidationError(`path ${fileRenameBody.newPath} is not a valid file path`);
		}

		return new FileRenameDto(normalizedDestPath, normalizedSourcePath);
	}
}
