/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@MinLength(3)
	public readonly username!: string;

	@IsString()
	@MinLength(4)
	public readonly password!: string;
}
