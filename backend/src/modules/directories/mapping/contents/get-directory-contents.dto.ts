/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { GetDirectoryContentsParams } from 'src/modules/directories/mapping/contents/get-directory-contents.params';

export class GetDirectoryContentsDto {
	readonly directoryId: string;

	readonly userId: string;

	private constructor(directoryId: string, userId: string) {
		this.directoryId = directoryId;
		this.userId = userId;
	}

	public static from(getDirectoryContentsParams: GetDirectoryContentsParams, jwt: JwtPayload): GetDirectoryContentsDto {
		return new GetDirectoryContentsDto(getDirectoryContentsParams.id, jwt.user.id);
	}
}
