/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
	public constructor(username: string) {
		super(`user ${username} already exists`);
	}
}
