import { BadRequestException } from '@nestjs/common';

export class InvalidDirectoryPathException extends BadRequestException {
	public constructor(path: string) {
		super(`${path} is not a valid directory path`);
	}
}
