import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';
import { DirectoryMetadataParams } from './DirectoryMetadataParams';

export class DirectoryMetadataDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryMetadataParams: DirectoryMetadataParams): DirectoryMetadataDto {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryMetadataParams.path);

		if (!PathUtils.isValidDirectoryPath(normalizedPath)) {
			throw new ValidationError(`path ${directoryMetadataParams.path} is not a valid directory path`);
		}

		return new DirectoryMetadataDto(directoryMetadataParams.path);
	}
}
