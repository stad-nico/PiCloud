import { DirectoryDeleteParams } from 'src/api/directory/mapping/delete/DirectoryDeleteParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class DirectoryDeleteDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryDeleteParams: DirectoryDeleteParams) {
		const normalizedPath = PathUtils.normalize(directoryDeleteParams.path);

		if (!PathUtils.isValidDirectoryPath(normalizedPath)) {
			throw new ValidationError(`path ${directoryDeleteParams.path} is not a valid directory path`);
		}

		return new DirectoryDeleteDto(normalizedPath);
	}
}
