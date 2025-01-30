/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryNameTooLongException } from 'src/modules/directories/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryNameException } from 'src/modules/directories/exceptions/InvalidDirectoryNameException';
import { DirectoryCreateBody } from 'src/modules/directories/mapping/create/DirectoryCreateBody';
import { DirectoryCreateParams } from 'src/modules/directories/mapping/create/DirectoryCreateParams';
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

	public static from(
		directoryCreateParams: DirectoryCreateParams,
		directoryCreateBody: DirectoryCreateBody,
		jwt: JwtPayload
	): DirectoryCreateDto {
		if (!PathUtils.isDirectoryNameValid(directoryCreateBody.name)) {
			throw new InvalidDirectoryNameException(directoryCreateBody.name);
		}

		if (!PathUtils.isDirectoryNameLengthValid(directoryCreateBody.name)) {
			throw new DirectoryNameTooLongException(directoryCreateBody.name);
		}

		return new DirectoryCreateDto(directoryCreateParams.id, directoryCreateBody.name, jwt.user.id);
	}
}
