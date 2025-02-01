/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export class UserApiDocs {
	public static controller() {
		return applyDecorators(ApiTags('users'), ApiBearerAuth());
	}

	public static get() {
		return applyDecorators();
	}

	public static create() {
		return applyDecorators();
	}
}
