/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { DirectoryMetadataParams } from 'src/api/directory/mapping/metadata/DirectoryMetadataParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryMetadataDto {
	/**
	 * The id of the directory to get the metadata from.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new DirectoryMetadataDto instance.
	 * @private @constructor
	 *
	 * @param   {string}               id the id of the directory
	 * @returns {DirectoryMetadataDto}    the DirectoryMetadataDto instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new DirectoryMetadataDto instance from the http params.
	 * @public @static
	 *
	 * @param   {DirectoryMetadataParams} directoryMetadataParams the http params
	 * @returns {DirectoryMetadataDto}                            the DirectoryMetadataDto instance
	 */
	public static from(directoryMetadataParams: DirectoryMetadataParams): DirectoryMetadataDto {
		return new DirectoryMetadataDto(directoryMetadataParams.id);
	}
}
