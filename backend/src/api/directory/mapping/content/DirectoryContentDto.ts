import { DirectoryContentParams } from 'src/api/directory/mapping/content/DirectoryContentParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class DirectoryContentDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryContentParams: DirectoryContentParams) {
		const normalizedPath = PathUtils.normalize(directoryContentParams.path);

		if (!PathUtils.isValidDirectoryPath(normalizedPath)) {
			throw new ValidationError(`path ${directoryContentParams.path} is not a valid directory path`);
		}

		return new DirectoryContentDto(directoryContentParams.path);
	}
}
