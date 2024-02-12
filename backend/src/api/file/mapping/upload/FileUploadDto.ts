import * as path from 'path';
import { Readable } from 'stream';

import { FileUploadParams } from 'src/api/file/mapping/upload/FileUploadParams';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class FileUploadDto {
	readonly path: string;

	readonly mimeType: string;

	readonly stream: Readable;

	private constructor(path: string, mimeType: string, stream: Readable) {
		this.path = path;
		this.mimeType = mimeType;
		this.stream = stream;
	}

	public static from(fileUploadParams: FileUploadParams, file: Express.Multer.File): FileUploadDto {
		if (!FileUtils.isFileValid(file)) {
			throw new ValidationError(`the given file is not a valid file`);
		}

		const normalizedPath = PathUtils.normalizeFilePath(fileUploadParams.path);

		if (!PathUtils.isFilePathValid(normalizedPath)) {
			throw new ValidationError(`path ${fileUploadParams.path} is not a valid file path`);
		}

		if (path.basename(normalizedPath).length > PathUtils.MaxFileNameLength) {
			throw new ValidationError(`file name ${path.basename(fileUploadParams.path)} exceeds the file name limit of 128 chars`);
		}

		return new FileUploadDto(normalizedPath, file.mimetype, file.stream);
	}
}
