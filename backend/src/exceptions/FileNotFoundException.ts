import { NotFoundException } from '@nestjs/common';

export class FileNotFoundException extends NotFoundException {
	public constructor(filePath: string) {
		super(`file ${filePath} does not exist`);
	}
}
