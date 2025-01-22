/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

import { File } from 'src/db/entities/file.entity';

type FileMetadataResponseType = Pick<File, 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>;

/**
 * Class representing the json http response.
 * @class
 */
export class FileMetadataResponse {
	/**
	 * The name of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The name of the file', type: 'string', example: 'file.txt' })
	readonly name: string;

	/**
	 * The mime type of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The name of the file', type: 'string', format: 'MimeType', example: 'text/plain' })
	readonly mimeType: string;

	/**
	 * The size of the file in bytes.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The size of the file in bytes', type: 'number', example: 1182 })
	readonly size: number;

	/**
	 * The creation date of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the file was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt: string;

	/**
	 * The date the file was last modified.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the file was last modified', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly updatedAt: string;

	/**
	 * Creates a new FileMetadataResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                    name        the name
	 * @param   {string}                    mimeType    the mime type
	 * @param   {number}                    size        the size
	 * @param   {string}                    createdAt   the creation date
	 * @param   {string}                    updatedAt   the last updated date
	 * @returns {FileMetadataResponse}                  the FileMetadataResponse instance
	 */
	private constructor(name: string, mimeType: string, size: number, createdAt: string, updatedAt: string) {
		this.name = name;
		this.mimeType = mimeType;
		this.size = size;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	/**
	 * Creates a new FileMetadataResponse instance from the metadata.
	 * @public @static
	 *
	 * @param   {FileMetadataResponseType} obj the metadata of the file
	 * @returns {FileMetadataResponse}         the FileMetadataResponse instance
	 */
	public static from(obj: FileMetadataResponseType): FileMetadataResponse {
		return new FileMetadataResponse(obj.name, obj.mimeType, obj.size, obj.createdAt.toISOString(), obj.updatedAt.toISOString());
	}
}
