/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { BadRequestException } from '@nestjs/common';

export class RootCannotBeDeletedException extends BadRequestException {
	public constructor() {
		super(`root directory cannot be deleted`);
	}
}
