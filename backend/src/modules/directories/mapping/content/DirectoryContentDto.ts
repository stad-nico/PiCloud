/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryContentParams } from 'src/modules/directories/mapping/content/DirectoryContentParams';

export class DirectoryContentDto {
	readonly directoryId: string;

	readonly userId: string;

	private constructor(directoryId: string, userId: string) {
		this.directoryId = directoryId;
		this.userId = userId;
	}

	public static from(directoryContentParams: DirectoryContentParams, jwt: JwtPayload) {
		return new DirectoryContentDto(directoryContentParams.id, jwt.user.id);
	}
}
