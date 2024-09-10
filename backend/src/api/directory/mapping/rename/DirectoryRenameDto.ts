/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { DirectoryRenameBody } from 'src/api/directory/mapping/rename/DirectoryRenameBody';
import { DirectoryRenameParams } from 'src/api/directory/mapping/rename/DirectoryRenameParams';
import { DirectoryNameTooLongException } from 'src/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryNameException } from 'src/exceptions/InvalidDirectoryNameException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryRenameDto {
	/**
	 * The id of the directory to rename.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * The new name of the directory.
	 * @type {string}
	 */
	readonly name: string;

	/**
	 * Creates a new DirectoryRenameDto instance.
	 * @private @constructor
	 *
	 * @param   {string}             id   the id of the directory to rename
	 * @param   {string}             name the new name of the directory
	 * @returns {DirectoryRenameDto}      the DirectoryRenameDto instance
	 */
	private constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	/**
	 * Creates a new DirectoryRenameDto instance from the http params and boty.
	 * Throws if the name is not valid or the name is too long.
	 * @public @static
	 *
	 * @throws  {InvalidDirectoryNameException} if the directory name is invalid
	 * @throws  {DirectoryNameTooLongException} if the directory name is too long
	 *
	 * @param   {DirectoryRenameParams} directoryRenameParams the http params
	 * @param   {DirectoryRenameBody}   directoryRenameBody   the http request body
	 * @returns {DirectoryRenameDto}                          the DirectoryRenameDto instance
	 */
	public static from(directoryRenameParams: DirectoryRenameParams, directoryRenameBody: DirectoryRenameBody): DirectoryRenameDto {
		if (!PathUtils.isDirectoryNameValid(directoryRenameBody.name)) {
			throw new InvalidDirectoryNameException(directoryRenameBody.name);
		}

		if (!PathUtils.isDirectoryNameLengthValid(directoryRenameBody.name)) {
			throw new DirectoryNameTooLongException(directoryRenameBody.name);
		}

		return new DirectoryRenameDto(directoryRenameParams.id, directoryRenameBody.name);
	}
}
