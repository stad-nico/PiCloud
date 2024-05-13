import { ConflictException } from '@nestjs/common';

export class FileAlreadyExistsException extends ConflictException {
	public constructor(filePath: string) {
		super(`file ${filePath} already exists`);
	}
}
