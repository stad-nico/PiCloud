import { FileDownloadParams } from 'src/api/file/mapping/download/FileDownloadParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class FileDownloadDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(fileDownloadParams: FileDownloadParams): FileDownloadDto {
		const normalizedPath = PathUtils.normalize(fileDownloadParams.path);

		if (!PathUtils.isValidFilePath(normalizedPath)) {
			throw new ValidationError(`path ${fileDownloadParams.path} is not a valid path`);
		}

		return new FileDownloadDto(normalizedPath);
	}
}
