/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryMetadataParams } from 'src/modules/directories/mapping/metadata/DirectoryMetadataParams';

export class DirectoryMetadataDto {
	readonly directoryId: string;

	readonly userId: string;

	private constructor(directoryId: string, userId: string) {
		this.directoryId = directoryId;
		this.userId = userId;
	}

	public static from(directoryMetadataParams: DirectoryMetadataParams, jwt: JwtPayload): DirectoryMetadataDto {
		return new DirectoryMetadataDto(directoryMetadataParams.id, jwt.user.id);
	}
}
