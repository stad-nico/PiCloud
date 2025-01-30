/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryRenameBody } from 'src/modules/directories/mapping/rename/DirectoryRenameBody';
import { DirectoryRenameParams } from 'src/modules/directories/mapping/rename/DirectoryRenameParams';
import { DirectoryNameTooLongException } from 'src/shared/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryNameException } from 'src/shared/exceptions/InvalidDirectoryNameException';
import { PathUtils } from 'src/util/PathUtils';

export class DirectoryRenameDto {
	readonly directoryId: string;

	readonly userId: string;

	readonly name: string;

	private constructor(directoryId: string, userId: string, name: string) {
		this.directoryId = directoryId;
		this.userId = userId;
		this.name = name;
	}

	public static from(directoryRenameParams: DirectoryRenameParams, directoryRenameBody: DirectoryRenameBody, jwt: JwtPayload): DirectoryRenameDto {
		if (!PathUtils.isDirectoryNameValid(directoryRenameBody.name)) {
			throw new InvalidDirectoryNameException(directoryRenameBody.name);
		}

		if (!PathUtils.isDirectoryNameLengthValid(directoryRenameBody.name)) {
			throw new DirectoryNameTooLongException(directoryRenameBody.name);
		}

		return new DirectoryRenameDto(directoryRenameParams.id, directoryRenameBody.name, jwt.user.id);
	}
}
