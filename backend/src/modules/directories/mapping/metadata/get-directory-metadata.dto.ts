/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { GetDirectoryMetadataParams } from 'src/modules/directories/mapping/metadata/get-directory-metadata.params';

export class GetDirectoryMetadataDto {
	readonly directoryId: string;

	readonly userId: string;

	private constructor(directoryId: string, userId: string) {
		this.directoryId = directoryId;
		this.userId = userId;
	}

	public static from(getDirectoryMetadataParams: GetDirectoryMetadataParams, jwt: JwtPayload): GetDirectoryMetadataDto {
		return new GetDirectoryMetadataDto(getDirectoryMetadataParams.id, jwt.user.id);
	}
}
