/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

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
	 * Whether the directory has subdirectories.
	 * @type {boolean}
	 */
	@ApiProperty({ description: 'Whether the directory has subdirectories', type: 'boolean', example: 'true' })
	readonly hasChildren!: boolean;
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
	public static from(content: DirectoryContentResponse) {
		return new DirectoryContentResponse(content.files, content.directories);
	}
}
