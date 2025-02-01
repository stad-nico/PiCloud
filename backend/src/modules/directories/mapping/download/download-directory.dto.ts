/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DownloadDirectoryParams } from 'src/modules/directories/mapping/download/download-directory.params';

export class DownloadDirectoryDto {
	readonly directoryId: string;

	readonly userId: string;

	private constructor(directoryId: string, userId: string) {
		this.directoryId = directoryId;
		this.userId = userId;
	}

	public static from(downloadDirectoryParams: DownloadDirectoryParams, jwt: JwtPayload): DownloadDirectoryDto {
		return new DownloadDirectoryDto(downloadDirectoryParams.id, jwt.user.id);
	}
}
