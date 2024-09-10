/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { ROOT_ID } from 'src/db/entities/Directory';

/**
 * Class representing the http request url params.
 * @class
 */
export class FileDeleteParams {
	/**
	 * The id of the files directory
	 * @type {string}
	 */
	@ApiProperty({
		examples: {
			root: { value: ROOT_ID, summary: 'Using the root id as parent id' },
			uuid: { value: '133a8736-111a-4cf7-ae84-dbe040ad4382', summary: 'Any other directory id' },
		},
		description: 'The id of the files directory',
	})
	readonly directoryId: string;

	/**
	 * The id of the file to delete.
	 * @type {string}
	 */
	@ApiProperty({ example: '853d4b18-8d1a-426c-b53e-74027ce1644b', description: 'The id of the file to delete' })
	readonly id: string;

	/**
	 * Creates a new FileDeleteParams instance.
	 * @private @constructor
	 *
	 * @param   {string}          directoryId the files directory id
	 * @param   {string}                   id the id of the file
	 * @returns {FileDeleteParams}            the FileDeleteParams instance
	 */
	private constructor(directoryId: string, id: string) {
		this.directoryId = directoryId;
		this.id = id;
	}
}
