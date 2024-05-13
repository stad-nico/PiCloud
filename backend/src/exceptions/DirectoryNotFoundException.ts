import { NotFoundException } from '@nestjs/common';

export class DirectoryNotFoundException extends NotFoundException {
	public constructor(directoryPath: string) {
		super(`directory ${directoryPath} does not exist`);
	}
}
