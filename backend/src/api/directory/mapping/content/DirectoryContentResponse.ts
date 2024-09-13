/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { DirectoryGetContentsDBResult } from 'src/api/directory/IDirectoryRepository';

export class DirectoryContentFile {
	/**
	 * The id of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The id of the file', type: 'string', example: '133a8736-111a-4cf7-ae84-dbe040ad4382' })
	readonly id!: string;

	/**
	 * The name of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The name of the file', type: 'string', example: 'file.txt' })
	readonly name!: string;

	/**
	 * The mime type of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The mime type of the file', type: 'string', example: 'file.txt' })
	readonly mimeType!: string;

	/**
	 * The size of the file in bytes.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The size of the file in bytes', type: 'number', example: 1193982 })
	readonly size!: number;

	/**
	 * The creation date of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the file was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt!: string;

	/**
	 * The date the file was last modified.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the file was last modified', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly updatedAt!: string;
}

export class DirectoryContentDirectory {
	/**
	 * The id of the directory.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The id of the directory', type: 'string', example: '133a8736-111a-4cf7-ae84-dbe040ad4382' })
	readonly id!: string;

	/**
	 * The name of the directory.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The name of the directory', type: 'string', example: 'photos' })
	readonly name!: string;

	/**
	 * The size of the directory in bytes.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The size of the directory in bytes', type: 'number', example: 1193982 })
	readonly size!: number;

	/**
	 * The amount of files this directory and each subdirectory contains in total.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The amount of files this directory and each subdirectory contains in total', type: 'number', example: 42 })
	readonly files!: number;

	/**
	 * The amount of subdirectory this directory contains in total.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The amount of subdirectories this directory contains in total', type: 'number', example: 9 })
	readonly directories!: number;

	/**
	 * The creation date of the directory.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the directory was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt!: string;

	/**
	 * The date the directory was last modified.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the directory was last modified', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly updatedAt!: string;
}

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryContentResponse {
	/**
	 * The files the directory contains.
	 * @type {DirectoryContentFile[]}
	 */
	@ApiProperty({ type: [DirectoryContentFile] })
	readonly files: DirectoryContentFile[];

	/**
	 * The subdirectories the directory contains.
	 * @type {DirectoryContentDirectoryType[]}
	 */
	@ApiProperty({ type: [DirectoryContentDirectory] })
	readonly directories: DirectoryContentDirectory[];

	/**
	 * Creates a new DirectoryContentResponse instance.
	 * @private @constructor
	 *
	 * @param   {DirectoryContentFile[]}      files       the files
	 * @param   {DirectoryContentDirectoryType[]} directories the directories
	 * @returns {DirectoryContentResponse}                    the DirectoryContentResponse instance
	 */
	private constructor(files: DirectoryContentFile[], directories: DirectoryContentDirectory[]) {
		this.files = files;
		this.directories = directories;
	}

	/**
	 * Creates a new DirectoryContentResponse instance from the content.
	 * @public @static
	 *
	 * @param   {DirectoryContentResponse} content the files and subdirectories
	 * @returns {DirectoryContentResponse}             the DirectoryContentResponse instance
	 */
	public static from(content: DirectoryGetContentsDBResult) {
		return new DirectoryContentResponse(
			content.files.map((file) => ({ ...file, createdAt: file.createdAt.toISOString(), updatedAt: file.updatedAt.toISOString() })),
			content.directories.map((directory) => ({
				...directory,
				createdAt: directory.createdAt.toISOString(),
				updatedAt: directory.updatedAt.toISOString(),
			}))
		);
	}
}
