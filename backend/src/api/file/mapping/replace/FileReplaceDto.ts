import { FileReplaceParams } from 'src/api/file/mapping/replace/FileReplaceParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class FileReplaceDto {
	readonly path: string;

	readonly mimeType: string;

	readonly buffer: Buffer;

	private constructor(path: string, mimeType: string, buffer: Buffer) {
		this.path = path;
		this.mimeType = mimeType;
		this.buffer = buffer;
	}

	public static from(
		fileUploadParams: FileReplaceParams,
		file: Pick<Express.Multer.File, 'mimetype' | 'size' | 'buffer'>
	): FileReplaceDto {
		const normalizedPath = PathUtils.normalizeFilePath(fileUploadParams.path);

		if (!PathUtils.isValidFilePath(normalizedPath)) {
			throw new ValidationError(`path ${fileUploadParams.path} is not a valid file path`);
		}

		return new FileReplaceDto(normalizedPath, file.mimetype, file.buffer);
	}
}
