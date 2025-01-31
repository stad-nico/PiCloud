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

export class FileUploadDto {
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

	public static from(fileUploadBody: FileUploadBody, file: Express.Multer.File, jwt: JwtPayload): FileUploadDto {
		const filename = Buffer.from(file.originalname, 'latin1').toString('utf8');

		if (!PathUtils.isFileNameValid(filename)) {
			throw new InvalidFileNameException(filename);
		}

		if (!PathUtils.isFileNameLengthValid(filename)) {
			throw new FileNameTooLongException(filename);
		}

		return new FileUploadDto(fileUploadBody.directoryId, filename, file.mimetype, file.size, file.buffer, jwt.user.id);
	}
}
