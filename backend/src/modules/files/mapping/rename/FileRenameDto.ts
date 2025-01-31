/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { FileRenameBody, FileRenameParams } from 'src/modules/files//mapping/rename';
import { FileNameTooLongException } from 'src/modules/files/exceptions/FileNameTooLongException';
import { InvalidFileNameException } from 'src/modules/files/exceptions/InvalidFileNameException';
import { PathUtils } from 'src/util/PathUtils';

export class FileRenameDto {
	readonly id: string;

	readonly name: string;

	readonly userId: string;

	private constructor(id: string, name: string, userId: string) {
		this.id = id;
		this.name = name;
		this.userId = userId;
	}

	public static from(fileRenameParams: FileRenameParams, fileRenameBody: FileRenameBody, jwt: JwtPayload): FileRenameDto {
		if (!PathUtils.isFileNameValid(fileRenameBody.name)) {
			throw new InvalidFileNameException(fileRenameBody.name);
		}

		if (!PathUtils.isFileNameLengthValid(fileRenameBody.name)) {
			throw new FileNameTooLongException(fileRenameBody.name);
		}

		return new FileRenameDto(fileRenameParams.id, fileRenameBody.name, jwt.user.id);
	}
}
