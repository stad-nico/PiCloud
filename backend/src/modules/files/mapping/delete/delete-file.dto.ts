/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DeleteFileParams } from 'src/modules/files/mapping/delete/delete-file.params';

export class DeleteFileDto {
	readonly id: string;

	readonly userId: string;

	private constructor(id: string, userId: string) {
		this.id = id;
		this.userId = userId;
	}

	public static from(deleteFileParams: DeleteFileParams, jwt: JwtPayload): DeleteFileDto {
		return new DeleteFileDto(deleteFileParams.id, jwt.user.id);
	}
}
