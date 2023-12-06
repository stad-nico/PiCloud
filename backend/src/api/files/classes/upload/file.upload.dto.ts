import { File } from 'src/api/files/entities/file.entity';

import { lookup } from 'mime-types';
import * as path from 'path';

export class FileUploadDto {
	readonly fullPath: string;

	readonly name: string;

	readonly path: string;

	readonly mimeType: string;

	readonly size: number;

	readonly buffer: Buffer;

	private constructor(fullPath: string, name: string, path: string, mimeType: string, size: number, buffer: Buffer) {
		this.fullPath = fullPath;
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
		this.buffer = buffer;
	}

	public static from(fullPath: string, file: Pick<Express.Multer.File, 'mimetype' | 'size' | 'buffer'>): FileUploadDto {
		return new FileUploadDto(
			fullPath,
			path.basename(fullPath),
			path.dirname(fullPath),
			lookup(fullPath) || 'octet-stream',
			file.size,
			file.buffer
		);
	}

	public toFile(): File {
		return new File(this.fullPath, this.name, this.path, this.mimeType, this.size);
	}
}
