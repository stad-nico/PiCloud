import { FileMetadataParams } from 'src/api/file/mapping/metadata/FileMetadataParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class FileMetadataDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(fileMetadataParams: FileMetadataParams): FileMetadataDto {
		const normalizedPath = PathUtils.normalizeFilePath(fileMetadataParams.path);

		if (!PathUtils.isValidFilePath(normalizedPath)) {
			throw new ValidationError(`path ${fileMetadataParams.path} is not a valid file path`);
		}

		return new FileMetadataDto(normalizedPath);
	}
}
