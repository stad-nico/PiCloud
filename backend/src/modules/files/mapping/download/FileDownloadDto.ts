/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { FileDownloadParams } from 'src/modules/files//mapping/download/FileDownloadParams';

export class FileDownloadDto {
	readonly id: string;

	readonly userId: string;

	private constructor(id: string, userId: string) {
		this.id = id;
		this.userId = userId;
	}

	public static from(fileDownloadParams: FileDownloadParams, jwt: JwtPayload) {
		return new FileDownloadDto(fileDownloadParams.id, jwt.user.id);
	}
}
