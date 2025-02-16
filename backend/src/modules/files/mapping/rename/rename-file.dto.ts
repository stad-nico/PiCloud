/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { FileNameTooLongException } from 'src/modules/files/exceptions/file-name-too-long.exception';
import { InvalidFileNameException } from 'src/modules/files/exceptions/invalid-file-name.exception';
import { RenameFileBody } from 'src/modules/files/mapping/rename/rename-file.body';
import { RenameFileParams } from 'src/modules/files/mapping/rename/rename-file.params';
import { PathUtils } from 'src/util/PathUtils';

export class RenameFileDto {
	readonly id: string;

	readonly name: string;

	readonly userId: string;

	private constructor(id: string, name: string, userId: string) {
		this.id = id;
		this.name = name;
		this.userId = userId;
	}

	public static from(renameFIleParams: RenameFileParams, renameFileBody: RenameFileBody, jwt: JwtPayload): RenameFileDto {
		if (!PathUtils.isFileNameValid(renameFileBody.name)) {
			throw new InvalidFileNameException(renameFileBody.name);
		}

		if (!PathUtils.isFileNameLengthValid(renameFileBody.name)) {
			throw new FileNameTooLongException(renameFileBody.name);
		}

		return new RenameFileDto(renameFIleParams.directoryId, renameFileBody.name, jwt.user.id);
	}
}
