import { DirectoryRenameBody } from 'src/api/directory/mapping/rename/directory.rename.body';
import { DirectoryRenameParams } from 'src/api/directory/mapping/rename/directory.rename.params';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class DirectoryRenameDto {
	readonly sourcePath: string;

	readonly destPath: string;

	readonly overwrite: boolean = false;

	private constructor(sourcePath: string, destPath: string, overwrite: boolean = false) {
		this.sourcePath = sourcePath;
		this.destPath = destPath;
		this.overwrite = overwrite;
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
