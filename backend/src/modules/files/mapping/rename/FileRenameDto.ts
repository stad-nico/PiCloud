/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { FileRenameBody, FileRenameParams } from 'src/modules/files//mapping/rename';
import { FileNameTooLongException } from 'src/shared/exceptions/FileNameTooLongException';
import { InvalidFileNameException } from 'src/shared/exceptions/InvalidFileNameException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileRenameDto {
	/**
	 * The id of the file to rename.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * The name to rename the file to.
	 * @type {string}
	 */
	readonly name: string;

	/**
	 * Creates a new FileRenameDto instance.
	 * @private @constructor
	 *
	 * @param   {string}        id   the id of the file to rename
	 * @param   {string}        name the name to rename the file to
	 * @returns {FileRenameDto}      the FileRenameDto instance
	 */
	private constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	/**
	 * Creates a new FileRenameDto instance from the http params.
	 * Throws if the name file is not valid or too long.
	 * @public @static
	 *
	 * @throws  {InvalidFileNameException} if the file name is invalid
	 * @throws  {FileNameTooLongException} if the file name is too long
	 *
	 * @param   {FileRenameParams} fileRenameParams the http params
	 * @param   {FileRenameBody}   fileRenameBody   the http request body
	 * @returns {FileRenameDto}                     the FileRenameDto instance
	 */
	public static from(fileRenameParams: FileRenameParams, fileRenameBody: FileRenameBody): FileRenameDto {
		if (!PathUtils.isFileNameValid(fileRenameBody.name)) {
			throw new InvalidFileNameException(fileRenameBody.name);
		}

		if (!PathUtils.isFileNameLengthValid(fileRenameBody.name)) {
			throw new FileNameTooLongException(fileRenameBody.name);
		}

		return new FileRenameDto(fileRenameParams.id, fileRenameBody.name);
	}
}
