/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { BadRequestException } from '@nestjs/common';

export class InvalidDirectoryNameException extends BadRequestException {
	public constructor(name: string) {
		super(`${name} is not a valid directory name`);
	}
}
