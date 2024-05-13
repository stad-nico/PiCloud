/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import * as path from 'path';

import { FileRenameBody, FileRenameParams } from 'src/api/file/mapping/rename';
import { FileNameTooLongException } from 'src/exceptions/FileNameTooLongException';
import { InvalidFilePathException } from 'src/exceptions/InvalidFilePathException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileRenameDto {
	/**
	 * The path of the file to rename.
	 * @type {string}
	 */
	readonly sourcePath: string;

	/**
	 * The path to rename the file to.
	 * @type {string}
	 */
	readonly destinationPath: string;

	/**
	 * Creates a new FileRenameDto instance.
	 * @private @constructor
	 *
	 * @param   {string}             sourcePath      the path of the file to rename
	 * @param   {string}             destinationPath the path to rename the file to
	 * @returns {FileRenameDto}                      the FileRenameDto instance
	 */
	private constructor(sourcePath: string, destinationPath: string) {
		this.sourcePath = sourcePath;
		this.destinationPath = destinationPath;
	}

	/**
	 * Creates a new FileRenameDto instance from the http params.
	 * Throws if the path is not valid or the file name is too long.
	 * @public @static
	 *
	 * @throws  {InvalidFilePathException} if the file path is invalid
	 * @throws  {FileNameTooLongException} if the file name is too long
	 *
	 * @param   {FileRenameParams} fileRenameParams the http params
	 * @param   {FileRenameBody}   fileRenameBody   the http request body
	 * @returns {FileRenameDto}                     the FileRenameDto instance
	 */
	public static from(fileRenameParams: FileRenameParams, fileRenameBody: FileRenameBody): FileRenameDto {
		const sourcePath = PathUtils.normalizeFilePath(fileRenameParams.path);

		const destPath = PathUtils.normalizeFilePath(fileRenameBody.newPath);

		if (!PathUtils.isFilePathValid(destPath)) {
			throw new InvalidFilePathException(fileRenameBody.newPath);
		}

		if (path.basename(destPath).length > PathUtils.MaxFileNameLength) {
			throw new FileNameTooLongException(fileRenameBody.newPath);
		}

		return new FileRenameDto(sourcePath, destPath);
	}
}
