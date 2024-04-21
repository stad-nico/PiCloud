import * as path from 'path';

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
		const normalizedSourcePath = PathUtils.normalizeFilePath(fileRenameParams.path);

		if (!PathUtils.isFilePathValid(normalizedSourcePath)) {
			throw new ValidationError(`path ${fileRenameParams.path} is not a valid file path`);
		}

		const normalizedDestPath = PathUtils.normalizeFilePath(fileRenameBody.newPath);

		if (!PathUtils.isFilePathValid(normalizedDestPath)) {
			throw new ValidationError(`path ${fileRenameBody.newPath} is not a valid file path`);
		}

		if (path.basename(normalizedDestPath).length > PathUtils.MaxFileNameLength) {
			throw new ValidationError(
				`destination file name ${path.basename(fileRenameBody.newPath)} exceeds the file name limit of ${PathUtils.MaxFileNameLength} chars`
			);
		}

		return new FileRenameDto(normalizedDestPath, normalizedSourcePath);
	}
}
