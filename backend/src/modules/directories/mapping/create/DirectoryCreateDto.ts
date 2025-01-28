/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { DirectoryCreateBody, DirectoryCreateParams } from 'src/modules/directories/mapping/create';
import { DirectoryNameTooLongException } from 'src/modules/directories/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryNameException } from 'src/modules/directories/exceptions/InvalidDirectoryNameException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryCreateDto {
	/**
	 * The id of the parent directory where the new directory will be created.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * The name of the new directory.
	 * @type {string}
	 */
	readonly name: string;

	/**
	 * Creates a new DirectoryCreateDto instance.
	 * @private @constructor
	 *
	 * @param   {string}             id   the id of the parent directory
	 * @param   {string}             name the name of the new directory
	 * @returns {DirectoryCreateDto}      the DirectoryCreateDto instance
	 */
	private constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	/**
	 * Creates a new DirectoryCreateDto instance from the http params and body.
	 * Throws if the directory name is not valid or too long.
	 * @public @static
	 *
	 * @throws  {InvalidDirectoryNameException} if the directory name is invalid
	 * @throws  {DirectoryNameTooLongException} if the directory name is too long
	 *
	 * @param   {DirectoryCreateParams} directoryCreateParams the http request params
	 * @param   {DirectoryCreateBody}   directoryCreateBody   the http request body
	 * @returns {DirectoryCreateDto}                          the DirectoryCreateDto instance
	 */
	public static from(directoryCreateParams: DirectoryCreateParams, directoryCreateBody: DirectoryCreateBody): DirectoryCreateDto {
		if (!PathUtils.isDirectoryNameValid(directoryCreateBody.name)) {
			throw new InvalidDirectoryNameException(directoryCreateBody.name);
		}

		if (!PathUtils.isDirectoryNameLengthValid(directoryCreateBody.name)) {
			throw new DirectoryNameTooLongException(directoryCreateBody.name);
		}

		return new DirectoryCreateDto(directoryCreateParams.id, directoryCreateBody.name);
	}
}
