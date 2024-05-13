import { NotFoundException } from '@nestjs/common';

export class ParentDirectoryNotFoundException extends NotFoundException {
	public constructor(parent: string) {
		super(`parent directory ${parent} does not exist`);
	}
}
