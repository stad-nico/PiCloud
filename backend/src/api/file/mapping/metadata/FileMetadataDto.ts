/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { FileMetadataParams } from 'src/api/file/mapping/metadata/FileMetadataParams';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileMetadataDto {
	/**
	 * The path of the file to get the metadata from.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new FileMetadataDto instance.
	 * @private @constructor
	 *
	 * @param   {string}               path the path of the file
	 * @returns {FileMetadataDto}           the FileMetadataDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new FileMetadataDto instance from the http params.
	 * @public @static
	 *
	 * @param   {FileMetadataParams} fileMetadataParams the http params
	 * @returns {FileMetadataDto}                       the FileMetadataDto instance
	 */
	public static from(fileMetadataParams: FileMetadataParams): FileMetadataDto {
		const normalizedPath = PathUtils.normalizeFilePath(fileMetadataParams.path);

		return new FileMetadataDto(normalizedPath);
	}
}
