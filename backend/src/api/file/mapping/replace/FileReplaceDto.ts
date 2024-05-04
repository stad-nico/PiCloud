import * as path from 'path';
import { Readable } from 'stream';

import { FileReplaceParams } from 'src/api/file/mapping/replace/FileReplaceParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class FileReplaceDto {
	readonly path: string;

	readonly mimeType: string;

	readonly size: number;

	readonly stream: Readable;

	private constructor(path: string, mimeType: string, size: number, stream: Readable) {
		this.path = path;
		this.mimeType = mimeType;
		this.stream = stream;
		this.size = size;
	}

	public static from(fileUploadParams: FileReplaceParams, file: Express.Multer.File): FileReplaceDto {
		const normalizedPath = PathUtils.normalizeFilePath(fileUploadParams.path);

		if (!PathUtils.isFilePathValid(normalizedPath)) {
			throw new ValidationError(`path ${fileUploadParams.path} is not a valid file path`);
		}

		if (path.basename(normalizedPath).length > PathUtils.MaxFileNameLength) {
			throw new ValidationError(`file name ${path.basename(fileUploadParams.path)} exceeds the file name limit of ${PathUtils.MaxFileNameLength} chars`);
		}

		return new FileReplaceDto(normalizedPath, file.mimetype, file.size, file.stream);
	}
}
