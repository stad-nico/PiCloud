/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DeleteDirectoryParams } from 'src/modules/directories/mapping/delete/delete-directory.params';

export class DeleteDirectoryDto {
	readonly directoryId: string;

	readonly userId: string;

	private constructor(directoryId: string, userId: string) {
		this.directoryId = directoryId;
		this.userId = userId;
	}

	public static from(deleteDirectoryParams: DeleteDirectoryParams, jwt: JwtPayload): DeleteDirectoryDto {
		return new DeleteDirectoryDto(deleteDirectoryParams.id, jwt.user.id);
	}
}
