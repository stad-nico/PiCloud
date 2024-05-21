/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import * as path from 'path';

import { FileUploadParams } from 'src/api/file/mapping/upload/FileUploadParams';
import { FileNameTooLongException } from 'src/exceptions/FileNameTooLongException';
import { InvalidFilePathException } from 'src/exceptions/InvalidFilePathException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileUploadDto {
	/**
	 * The path of the file.
	 * @type {string}
	 */
	readonly path: string;

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
	 * @param   {string}        path     the path of the file
	 * @param   {string}        mimeType the mime type of the file
	 * @param   {number}        size     the size of the file in bytes
	 * @param   {Buffer}        buffer   the content of the file
	 * @returns {FileUploadDto}          the FileUploadDto instance
	 */
	private constructor(path: string, mimeType: string, size: number, buffer: Buffer) {
		this.path = path;
		this.mimeType = mimeType;
		this.buffer = buffer;
		this.size = size;
	}

	/**
	 * Creates a new FileUploadDto instance from the http params.
	 * Throws if the path is not valid or the file name is too long.
	 * @public @static
	 *
	 * @throws  {InvalidFilePathException} if the path is invalid
	 * @throws  {FileNameTooLongException} if the file name is too long
	 *
	 * @param   {FileUploadParams} fileUploadParams the http params
	 * @returns {FileUploadDto}                     the FileCreateDto instance
	 */
	public static from(fileUploadParams: FileUploadParams, file: Express.Multer.File): FileUploadDto {
		const normalizedPath = PathUtils.normalizeFilePath(fileUploadParams.path);

		if (!PathUtils.isFilePathValid(normalizedPath)) {
			throw new InvalidFilePathException(fileUploadParams.path);
		}

		if (path.basename(normalizedPath).length > PathUtils.MaxFileNameLength) {
			throw new FileNameTooLongException(fileUploadParams.path);
		}

		return new FileUploadDto(normalizedPath, file.mimetype, file.size, file.buffer);
	}
}
