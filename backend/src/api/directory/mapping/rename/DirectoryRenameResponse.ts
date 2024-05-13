/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryRenameResponse {
	/**
	 * The path of the directory after renaming.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The path of the directory after renaming', example: '/new/path/to/directory' })
	readonly path: string;

	/**
	 * Creates a new DirectoryRenameResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the directory after renaming
	 * @returns {DirectoryRenameResponse}      the DirectoryRenameResponse instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryRenameResponse instance from the new path.
	 * @public @static
	 *
	 * @param   {string}                  destinationPath the new path
	 * @returns {DirectoryRenameResponse}                 the DirectoryRenameResponse instance
	 */
	public static from(destinationPath: string) {
		return new DirectoryRenameResponse(PathUtils.normalizeDirectoryPath(destinationPath));
	}
}
