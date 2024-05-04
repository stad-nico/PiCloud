import { FileDeleteParams } from 'src/api/file/mapping/delete/FileDeleteParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class FileDeleteDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(fileDeleteParams: FileDeleteParams): FileDeleteDto {
		const normalizedPath = PathUtils.normalizeFilePath(fileDeleteParams.path);

		if (!PathUtils.isFilePathValid(normalizedPath)) {
			throw new ValidationError(`path ${fileDeleteParams.path} is not a valid file path`);
		}

		return new FileDeleteDto(normalizedPath);
	}
}
