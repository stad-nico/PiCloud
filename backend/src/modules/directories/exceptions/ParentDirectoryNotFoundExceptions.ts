/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { NotFoundException } from '@nestjs/common';

export class ParentDirectoryNotFoundException extends NotFoundException {
	public constructor(parent: string) {
		super(`parent directory ${parent} does not exist`);
	}
}
