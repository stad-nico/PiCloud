/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { FileNameTooLongException } from 'src/modules/files/exceptions/FileNameTooLongException';
import { InvalidFileNameException } from 'src/modules/files/exceptions/InvalidFileNameException';
import { FileUploadBody } from 'src/modules/files/mapping/upload/FileUploadBody';
import { PathUtils } from 'src/util/PathUtils';

export class FileReplaceDto {
	readonly parentId: string;

	readonly name: string;

	readonly mimeType: string;

	readonly size: number;

	readonly content: Buffer;

	readonly userId: string;

	private constructor(parentId: string, name: string, mimeType: string, size: number, content: Buffer, userId: string) {
		this.parentId = parentId;
		this.name = name;
		this.mimeType = mimeType;
		this.content = content;
		this.size = size;
		this.userId = userId;
	}

	public static from(fileUploadBoy: FileUploadBody, file: Express.Multer.File, jwt: JwtPayload): FileReplaceDto {
		if (!PathUtils.isFileNameValid(file.originalname)) {
			throw new InvalidFileNameException(file.originalname);
		}

		if (!PathUtils.isFileNameLengthValid(file.originalname)) {
			throw new FileNameTooLongException(file.originalname);
		}

		return new FileReplaceDto(fileUploadBoy.directoryId, file.originalname, file.mimetype, file.size, file.buffer, jwt.user.id);
	}
}
