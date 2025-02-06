/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryNameTooLongException } from 'src/modules/directories/exceptions/directory-name-too-long.exception';
import { InvalidDirectoryNameException } from 'src/modules/directories/exceptions/invalid-directory-name.exception';
import { CreateDirectoryBody } from 'src/modules/directories/mapping/create/create-directory.body';
import { CreateDirectoryParams } from 'src/modules/directories/mapping/create/create-directory.params';
import { PathUtils } from 'src/util/PathUtils';

export class CreateDirectoryDto {
	readonly parentId: string;

	readonly name: string;

	readonly userId: string;

	private constructor(parentId: string, name: string, userId: string) {
		this.parentId = parentId;
		this.name = name;
		this.userId = userId;
	}

	public static from(
		createDirectoryParams: CreateDirectoryParams,
		createDirectoryBody: CreateDirectoryBody,
		jwt: JwtPayload
	): CreateDirectoryDto {
		if (!PathUtils.isDirectoryNameValid(createDirectoryBody.name)) {
			throw new InvalidDirectoryNameException(createDirectoryBody.name);
		}

		if (!PathUtils.isDirectoryNameLengthValid(createDirectoryBody.name)) {
			throw new DirectoryNameTooLongException(createDirectoryBody.name);
		}

		return new CreateDirectoryDto(createDirectoryParams.id, createDirectoryBody.name, jwt.user.id);
	}
}
