/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { GetFileMetadataParams } from 'src/modules/files/mapping/metadata/get-file-metadata.params';

export class GetFileMetadataDto {
	readonly id: string;

	readonly userId: string;

	private constructor(id: string, userId: string) {
		this.id = id;
		this.userId = userId;
	}

	public static from(getFileMetadataParams: GetFileMetadataParams, jwt: JwtPayload): GetFileMetadataDto {
		return new GetFileMetadataDto(getFileMetadataParams.id, jwt.user.id);
	}
}
