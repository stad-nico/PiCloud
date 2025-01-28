/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ConflictException } from '@nestjs/common';

export class FileAlreadyExistsException extends ConflictException {
	public constructor(filePath: string) {
		super(`file ${filePath} already exists`);
	}
}
