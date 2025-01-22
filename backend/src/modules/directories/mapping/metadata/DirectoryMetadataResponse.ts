/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { DirectoryGetMetadataDBResult } from 'src/modules/directories/IDirectoriesRepository';

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryMetadataResponse {
	/**
	 * The parentId of the directory.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The parentId of the directory', type: 'string', example: '024eb278-6ebf-11ef-9656-98fc84e066e5' })
	readonly parentId: string;

	/**
	 * The name of the directory.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The name of the directory', type: 'string', example: 'photos' })
	readonly name: string;

	/**
	 * The size of the directory in bytes.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The size of the directory in bytes', type: 'number', example: 1193982 })
	readonly size: number;

	/**
	 * The amount of files this directory and each subdirectory contains in total.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The amount of files this directory and each subdirectory contains in total', type: 'number', example: 42 })
	readonly files: number;

	/**
	 * The amount of subdirectory this directory contains in total.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The amount of subdirectories this directory contains in total', type: 'number', example: 9 })
	readonly directories: number;

	/**
	 * The creation date of the directory.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the directory was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt: string;

	/**
	 * The date the directory was last modified.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the directory was last modified', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly updatedAt: string;

	/**
	 * Creates a new DirectoryMetadataResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                    parentId    the parentId
	 * @param   {string}                    name        the name
	 * @param   {number}                    size        the size
	 * @param   {number}                    files       the amount of files
	 * @param   {number}                    directories the amount of subdirectories
	 * @param   {string}                    createdAt   the creation date
	 * @param   {string}                    updatedAt   the last updated date
	 * @returns {DirectoryMetadataResponse}             the DirectoryMetadataResponse instance
	 */
	private constructor(parentId: string, name: string, size: number, files: number, directories: number, createdAt: string, updatedAt: string) {
		this.parentId = parentId;
		this.name = name;
		this.size = size;
		this.files = files;
		this.directories = directories;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	/**
	 * Creates a new DirectoryMetadataResponse instance from the metadata.
	 * @public @static
	 *
	 * @param   {DirectoryGetMetadataDBResult} obj the metadata of the directory
	 * @returns {DirectoryMetadataResponse}         the DirectoryMetadataResponse instance
	 */
	public static from(obj: DirectoryGetMetadataDBResult): DirectoryMetadataResponse {
		return new DirectoryMetadataResponse(
			obj.parentId,
			obj.name,
			obj.size,
			obj.files,
			obj.directories,
			obj.createdAt.toISOString(),
			obj.updatedAt.toISOString()
		);
	}
}
