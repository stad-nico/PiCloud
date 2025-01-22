/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/

import { ApiProperty } from '@nestjs/swagger';
import { ROOT_ID } from 'src/db/entities/directory.entity';

/**
 * Class representing the http request body.
 * @class
 */
export class FileUploadBody {
	/**
	 * The id of the parent directory where the file will be stored.
	 * @type {string}
	 */
	@ApiProperty({
		examples: {
			root: { value: ROOT_ID, summary: 'Using the root id as parent id' },
			uuid: { value: '133a8736-111a-4cf7-ae84-dbe040ad4382', summary: 'Any other directory id' },
		},
		description: 'The id of the parent directory where the file will be stored',
	})
	readonly directoryId: string;

	/**
	 * Creates a new FileUploadBody instance.
	 *
	 * @param   {string}         directoryId the id of the directory
	 * @returns {FileUploadBody}             the FileUploadBody instance
	 */
	private constructor(directoryId: string) {
		this.directoryId = directoryId;
	}
}
