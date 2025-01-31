/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { FileMetadataParams } from 'src/modules/files//mapping/metadata/FileMetadataParams';

export class FileMetadataDto {
	readonly id: string;

	readonly userId: string;

	private constructor(id: string, userId: string) {
		this.id = id;
		this.userId = userId;
	}

	public static from(fileMetadataParams: FileMetadataParams, jwt: JwtPayload): FileMetadataDto {
		return new FileMetadataDto(fileMetadataParams.id, jwt.user.id);
	}
}
