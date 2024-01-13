import { DirectoryCreateParams } from 'src/api/directory/mapping/create/DirectoryCreateParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class DirectoryCreateDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryCreateParams: DirectoryCreateParams) {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryCreateParams.path);

		if (!PathUtils.isValidDirectoryPath(normalizedPath)) {
			throw new ValidationError(`path ${directoryCreateParams.path} is not a valid directory path`);
		}

		return new DirectoryCreateDto(normalizedPath);
	}
}
