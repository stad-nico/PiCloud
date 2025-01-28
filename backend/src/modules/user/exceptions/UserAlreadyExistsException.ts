import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
	public constructor(username: string) {
		super(`user ${username} already exists`);
	}
}
