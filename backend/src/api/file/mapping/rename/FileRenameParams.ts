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
export class FileRenameParams {
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
	 * The id of the file to rename
	 * @type {string}
	 */
	@ApiProperty({
		examples: {
			root: { value: ROOT_ID, summary: 'Using the root id as parent id' },
			uuid: { value: '133a8736-111a-4cf7-ae84-dbe040ad4382', summary: 'Any other directory id' },
		},
		description: 'The id of the parent directory where the file will be stored',
	})
	readonly id: string;

	/**
	 * Creates a new FileRenameParams instance.
	 * @private @constructor
	 *
	 * @param   {string}           directoryId the files directory id
	 * @param   {string}           id          the id of the file
	 * @returns {FileRenameParams}             the FileRenameParams instance
	 */
	private constructor(directoryId: string, id: string) {
		this.directoryId = directoryId;
		this.id = id;
	}
}
