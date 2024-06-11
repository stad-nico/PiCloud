/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import * as path from 'path';

import { DirectoryRenameBody } from 'src/api/directory/mapping/rename/DirectoryRenameBody';
import { DirectoryRenameParams } from 'src/api/directory/mapping/rename/DirectoryRenameParams';
import { DirectoryNameTooLongException } from 'src/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryPathException } from 'src/exceptions/InvalidDirectoryPathException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryRenameDto {
	/**
	 * The path of the directory to rename.
	 * @type {string}
	 */
	readonly sourcePath: string;

	/**
	 * The path to rename the directory to.
	 * @type {string}
	 */
	readonly destinationPath: string;

	/**
	 * Creates a new DirectoryRenameDto instance.
	 * @private @constructor
	 *
	 * @param   {string}             sourcePath      the path of the directory to rename
	 * @param   {string}             destinationPath the path to rename the directory to
	 * @returns {DirectoryRenameDto}                 the DirectoryRenameDto instance
	 */
	private constructor(sourcePath: string, destinationPath: string) {
		this.sourcePath = sourcePath;
		this.destinationPath = destinationPath;
	}

	/**
	 * Creates a new DirectoryRenameDto instance from the http params.
	 * Throws if the path is not valid or the directory name is too long.
	 * @public @static
	 *
	 * @throws  {InvalidDirectoryPathException} if the directory path is invalid
	 * @throws  {DirectoryNameTooLongException} if the directory name is too long
	 *
	 * @param   {DirectoryRenameParams} directoryRenameParams the http params
	 * @param   {DirectoryRenameBody}   directoryRenameBody   the http request body
	 * @returns {DirectoryRenameDto}                          the DirectoryRenameDto instance
	 */
	public static from(directoryRenameParams: DirectoryRenameParams, directoryRenameBody: DirectoryRenameBody): DirectoryRenameDto {
		const sourcePath = PathUtils.normalizeDirectoryPath(directoryRenameParams.path);

		const destPath = PathUtils.normalizeDirectoryPath(directoryRenameBody.newPath);

		if (!PathUtils.isDirectoryPathValid(destPath)) {
			throw new InvalidDirectoryPathException(directoryRenameBody.newPath);
		}

		if (path.basename(destPath).length > PathUtils.MaxDirectoryNameLength) {
			throw new DirectoryNameTooLongException(path.basename(directoryRenameBody.newPath));
		}

		return new DirectoryRenameDto(sourcePath, destPath);
	}
}
