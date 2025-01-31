/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
	@IsString()
	@MinLength(3)
	username!: string;

	@IsString()
	@MinLength(4)
	password!: string;
}
