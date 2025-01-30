/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryCreateBody, DirectoryCreateParams } from 'src/modules/directories/mapping/create';
import { DirectoryNameTooLongException } from 'src/shared/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryNameException } from 'src/shared/exceptions/InvalidDirectoryNameException';
import { PathUtils } from 'src/util/PathUtils';

export class DirectoryCreateDto {
	readonly parentId: string;

	readonly name: string;

	readonly userId: string;

	private constructor(parentId: string, name: string, userId: string) {
		this.parentId = parentId;
		this.name = name;
		this.userId = userId;
	}

	public static from(directoryCreateParams: DirectoryCreateParams, directoryCreateBody: DirectoryCreateBody, jwt: JwtPayload): DirectoryCreateDto {
		if (!PathUtils.isDirectoryNameValid(directoryCreateBody.name)) {
			throw new InvalidDirectoryNameException(directoryCreateBody.name);
		}

		if (!PathUtils.isDirectoryNameLengthValid(directoryCreateBody.name)) {
			throw new DirectoryNameTooLongException(directoryCreateBody.name);
		}

		return new DirectoryCreateDto(directoryCreateParams.id, directoryCreateBody.name, jwt.user.id);
	}
}
