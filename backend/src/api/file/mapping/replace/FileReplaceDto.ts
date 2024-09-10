/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { FileUploadParams } from 'src/api/file/mapping/upload/FileUploadParams';
import { FileNameTooLongException } from 'src/exceptions/FileNameTooLongException';
import { InvalidFileNameException } from 'src/exceptions/InvalidFileNameException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileReplaceDto {
	/**
	 * The id of the parent directory where the file will be stored.
	 * @type {string}
	 */
	readonly parentId: string;

	/**
	 * The name of the file.
	 * @type {string}
	 */
	readonly name: string;

	/**
	 * The mime type of the file.
	 * @type {string}
	 */
	readonly mimeType: string;

	/**
	 * The size of the file in bytes.
	 * @type {number}
	 */
	readonly size: number;

	/**
	 * The file content.
	 * @type {Buffer}
	 */
	readonly buffer: Buffer;

	/**
	 * Creates a new FileReplaceDto instance.
	 * @private @constructor
	 *
	 * @param   {string}        parentId the parent id of the file
	 * @param   {string}        name     the name of the file
	 * @param   {string}        mimeType the mime type of the file
	 * @param   {number}        size     the size of the file in bytes
	 * @param   {Buffer}        buffer   the content of the file
	 * @returns {FileReplaceDto}         the FileReplaceDto instance
	 */
	private constructor(parentId: string, name: string, mimeType: string, size: number, buffer: Buffer) {
		this.parentId = parentId;
		this.name = name;
		this.mimeType = mimeType;
		this.buffer = buffer;
		this.size = size;
	}

	/**
	 * Creates a new FileReplaceDto instance from the http params and file.
	 * Throws if the file name is not valid or too long.
	 * @public @static
	 *
	 * @throws  {InvalidFileNameException} if the file name is invalid
	 * @throws  {FileNameTooLongException} if the file name is too long
	 *
	 * @param   {FileUploadParams}    fileUploadParams the http request params
	 * @param   {Express.Multer.File} file             the uploaded file
	 * @returns {FileReplaceDto}                       the FileReplaceDto instance
	 */
	public static from(fileUploadParams: FileUploadParams, file: Express.Multer.File): FileReplaceDto {
		if (!PathUtils.isFileNameValid(file.originalname)) {
			throw new InvalidFileNameException(file.originalname);
		}

		if (!PathUtils.isFileNameLengthValid(file.originalname)) {
			throw new FileNameTooLongException(file.originalname);
		}

		return new FileReplaceDto(fileUploadParams.id, file.originalname, file.mimetype, file.size, file.buffer);
	}
}
