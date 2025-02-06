/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryNameTooLongException } from 'src/modules/directories/exceptions/directory-name-too-long.exception';
import { InvalidDirectoryNameException } from 'src/modules/directories/exceptions/invalid-directory-name.exception';
import { RenameDirectoryBody } from 'src/modules/directories/mapping/rename/rename-directory.body';
import { RenameDirectoryParams } from 'src/modules/directories/mapping/rename/rename-directory.params';
import { PathUtils } from 'src/util/PathUtils';

export class RenameDirectoryDto {
	readonly directoryId: string;

	readonly userId: string;

	readonly name: string;

	private constructor(directoryId: string, userId: string, name: string) {
		this.directoryId = directoryId;
		this.userId = userId;
		this.name = name;
	}

	public static from(
		renameDirectoryParams: RenameDirectoryParams,
		RenameDirectoryBody: RenameDirectoryBody,
		jwt: JwtPayload
	): RenameDirectoryDto {
		if (!PathUtils.isDirectoryNameValid(RenameDirectoryBody.name)) {
			throw new InvalidDirectoryNameException(RenameDirectoryBody.name);
		}

		if (!PathUtils.isDirectoryNameLengthValid(RenameDirectoryBody.name)) {
			throw new DirectoryNameTooLongException(RenameDirectoryBody.name);
		}

		return new RenameDirectoryDto(renameDirectoryParams.id, jwt.user.id, RenameDirectoryBody.name);
	}
}
