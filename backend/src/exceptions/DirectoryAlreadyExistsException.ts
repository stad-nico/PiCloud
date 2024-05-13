import { ConflictException } from '@nestjs/common';

export class DirectoryAlreadyExistsException extends ConflictException {
	public constructor(directoryPath: string) {
		super(`directory ${directoryPath} already exists`);
	}
}
