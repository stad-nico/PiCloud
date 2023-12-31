import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';
import { DirectoryDownloadParams } from './directory.download.params';

export class DirectoryDownloadDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryDownloadParams: DirectoryDownloadParams) {
		const normalizedPath = PathUtils.normalize(directoryDownloadParams.path);

		if (!PathUtils.isValidDirectoryPath(normalizedPath)) {
			throw new ValidationError(`path ${directoryDownloadParams.path} is not a valid directory path`);
		}

		return new DirectoryDownloadDto(normalizedPath);
	}
}
