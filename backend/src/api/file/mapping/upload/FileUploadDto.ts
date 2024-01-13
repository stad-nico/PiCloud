import { FileUploadParams } from 'src/api/file/mapping/upload/FileUploadParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class FileUploadDto {
	readonly path: string;

	readonly mimeType: string;

	readonly buffer: Buffer;

	private constructor(path: string, mimeType: string, buffer: Buffer) {
		this.path = path;
		this.mimeType = mimeType;
		this.buffer = buffer;
	}

	public static from(fileUploadParams: FileUploadParams, file: Pick<Express.Multer.File, 'mimetype' | 'size' | 'buffer'>): FileUploadDto {
		const normalizedPath = PathUtils.normalizeFilePath(fileUploadParams.path);

		if (!PathUtils.isValidFilePath(normalizedPath)) {
			throw new ValidationError(`path ${fileUploadParams.path} is not a valid file path`);
		}

		return new FileUploadDto(normalizedPath, file.mimetype, file.buffer);
	}
}
