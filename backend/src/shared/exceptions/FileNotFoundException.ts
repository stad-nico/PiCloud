/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { NotFoundException } from '@nestjs/common';

export class FileNotFoundException extends NotFoundException {
	public constructor(filePath: string) {
		super(`file ${filePath} does not exist`);
	}
}
