import { BadRequestException } from '@nestjs/common';

export class InvalidFilePathException extends BadRequestException {
	public constructor(path: string) {
		super(`${path} is not a valid file path`);
	}
}
