/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryDownloadParams } from 'src/modules/directories/mapping/download/DirectoryDownloadParams';

export class DirectoryDownloadDto {
	readonly directoryId: string;

	readonly userId: string;

	private constructor(directoryId: string, userId: string) {
		this.directoryId = directoryId;
		this.userId = userId;
	}

	public static from(directoryDownloadParams: DirectoryDownloadParams, jwt: JwtPayload) {
		return new DirectoryDownloadDto(directoryDownloadParams.id, jwt.user.id);
	}
}
