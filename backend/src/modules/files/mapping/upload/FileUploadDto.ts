/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { FileUploadBody } from 'src/modules/files/mapping/upload/FileUploadBody';
import { FileNameTooLongException } from 'src/shared/exceptions/FileNameTooLongException';
import { InvalidFileNameException } from 'src/shared/exceptions/InvalidFileNameException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileUploadDto {
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
	 * Creates a new FileUploadDto instance.
	 * @private @constructor
	 *
	 * @param   {string}        parentId the parent id of the file
	 * @param   {string}        name     the name of the file
	 * @param   {string}        mimeType the mime type of the file
	 * @param   {number}        size     the size of the file in bytes
	 * @param   {Buffer}        buffer   the content of the file
	 * @returns {FileUploadDto}          the FileUploadDto instance
	 */
	private constructor(parentId: string, name: string, mimeType: string, size: number, buffer: Buffer) {
		this.parentId = parentId;
		this.name = name;
		this.mimeType = mimeType;
		this.buffer = buffer;
		this.size = size;
	}

	/**
	 * Creates a new FileUploadDto instance from the http params and file.
	 * Throws if the file name is not valid or too long.
	 * @public @static
	 *
	 * @throws  {InvalidFileNameException} if the file name is invalid
	 * @throws  {FileNameTooLongException} if the file name is too long
	 *
	 * @param   {FileUploadBody}      fileUploadBody the http request body
	 * @param   {Express.Multer.File} file           the uploaded file
	 * @returns {FileUploadDto}                      the FileUploadDto instance
	 */
	public static from(fileUploadBody: FileUploadBody, file: Express.Multer.File): FileUploadDto {
		const filename = Buffer.from(file.originalname, 'latin1').toString('utf8');

		if (!PathUtils.isFileNameValid(filename)) {
			throw new InvalidFileNameException(filename);
		}

		if (!PathUtils.isFileNameLengthValid(filename)) {
			throw new FileNameTooLongException(filename);
		}

		return new FileUploadDto(fileUploadBody.directoryId, filename, file.mimetype, file.size, file.buffer);
	}
}
