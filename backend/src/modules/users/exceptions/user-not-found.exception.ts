/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
	public constructor(nameOrId: string) {
		super(`user ${nameOrId} does not exist`);
	}
}
