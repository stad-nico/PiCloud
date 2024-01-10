import { DirectoryRenameBody } from 'src/api/directory/mapping/rename/DirectoryRenameBody';
import { DirectoryRenameParams } from 'src/api/directory/mapping/rename/DirectoryRenameParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class DirectoryRenameDto {
	readonly sourcePath: string;

	readonly destPath: string;

	private constructor(sourcePath: string, destPath: string) {
		this.sourcePath = sourcePath;
		this.destPath = destPath;
	}

	public static from(directoryRenameParams: DirectoryRenameParams, directoryRenameBody: DirectoryRenameBody): DirectoryRenameDto {
		const sourcePath = PathUtils.normalize(directoryRenameParams.path);
		const destPath = PathUtils.normalize(directoryRenameBody.newPath);

		if (!PathUtils.isValidDirectoryPath(sourcePath)) {
			throw new ValidationError(`path ${sourcePath} is not a valid directory path`);
		}

		if (!PathUtils.isValidDirectoryPath(destPath)) {
			throw new ValidationError(`path ${destPath} is not a valid directory path`);
		}

		return new DirectoryRenameDto(directoryRenameParams.path, directoryRenameBody.newPath);
	}
}
