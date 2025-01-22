/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { FileMetadataParams } from 'src/modules/files//mapping/metadata/FileMetadataParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileMetadataDto {
	/**
	 * The id of the file to get the metadata from
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new FileMetadataDto instance.
	 * @private @constructor
	 *
	 * @param   {string}          id       the id of the file
	 * @returns {FileMetadataDto}          the FileMetadataDto instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new FileMetadataDto instance from the http params.
	 * @public @static
	 *
	 * @param   {FileMetadataParams} fileMetadataParams the http params
	 * @returns {FileMetadataDto}                       the FileMetadataDto instance
	 */
	public static from(fileMetadataParams: FileMetadataParams): FileMetadataDto {
		return new FileMetadataDto(fileMetadataParams.id);
	}
}
