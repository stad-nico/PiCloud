/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryDeleteParams {
	/**
	 * The id of the directory to delete.
	 * @type {string}
	 */
	@ApiProperty({
		examples: {
			uuid: { value: '133a8736-111a-4cf7-ae84-dbe040ad4382', summary: 'Any directory id' },
		},
		description: 'The id of the directory to delete',
	})
	readonly id: string;

	/**
	 * Creates a new DirectoryDeleteParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                id the id of the directory
	 * @returns {DirectoryDeleteParams}    the DirectoryDeleteParams instance
	 */
	private constructor(id: string) {
		this.id = id;
	}
}
