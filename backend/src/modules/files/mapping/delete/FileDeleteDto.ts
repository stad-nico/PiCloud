/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { FileDeleteParams } from 'src/modules/files//mapping/delete/FileDeleteParams';

export class FileDeleteDto {
	readonly id: string;

	readonly userId: string;

	private constructor(id: string, userId: string) {
		this.id = id;
		this.userId = userId;
	}

	public static from(fileDeleteParams: FileDeleteParams, jwt: JwtPayload) {
		return new FileDeleteDto(fileDeleteParams.id, jwt.user.id);
	}
}
