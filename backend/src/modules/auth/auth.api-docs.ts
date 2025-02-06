/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

export class AuthApiDocs {
	public static controller() {
		return applyDecorators(ApiTags('auth'), ApiBearerAuth());
	}

	public static login() {
		return applyDecorators(ApiExcludeEndpoint());
	}
}
