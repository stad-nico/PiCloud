/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DownlaodFileParams } from 'src/modules/files/mapping/download/download-file.params';

export class DownloadFileDto {
	readonly id: string;

	readonly userId: string;

	private constructor(id: string, userId: string) {
		this.id = id;
		this.userId = userId;
	}

	public static from(downloadFileParams: DownlaodFileParams, jwt: JwtPayload) {
		return new DownloadFileDto(downloadFileParams.id, jwt.user.id);
	}
}
