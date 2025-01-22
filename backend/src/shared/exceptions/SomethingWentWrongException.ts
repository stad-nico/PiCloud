/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { InternalServerErrorException } from '@nestjs/common';

export class SomethingWentWrongException extends InternalServerErrorException {
	public constructor() {
		super(`something went wrong`);
	}
}
