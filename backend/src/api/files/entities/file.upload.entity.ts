import * as path from 'path';
import { File } from 'src/api/files/entities/file.entity';

export class FileUploadEntity {
	fullPath: string;

	name: string;

	path: string;

	mimeType: string;

	size: number;

	buffer: Buffer;

	private constructor(fullPath: string, name: string, path: string, mimeType: string, size: number, buffer: Buffer) {
		this.fullPath = fullPath;
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
		this.buffer = buffer;
	}

	public static from(fullPath: string, file: Pick<Express.Multer.File, 'mimetype' | 'size' | 'buffer'>): FileUploadEntity {
		return new FileUploadEntity(fullPath, path.basename(fullPath), path.dirname(fullPath), file.mimetype, file.size, file.buffer);
	}

	public toFile(): File {
		return new File(this.fullPath, this.name, this.path, this.mimeType, this.size);
	}
}
