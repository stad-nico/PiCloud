/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the http request url params.
 * @class
 */
export class FileMetadataParams {
	/**
	 * The id of the file to get the metadata from
	 * @type {string}
	 */
	@ApiProperty({
		examples: {
			uuid: { value: '133a8736-111a-4cf7-ae84-dbe040ad4382', summary: 'Valid file id' },
		},
		description: 'The id of the file to get the metadata from',
	})
	readonly id: string;

	/**
	 * Creates a new FileMetadataParams instance.
	 * @private @constructor
	 *
	 * @param   {string}             id          the id of the file
	 * @returns {FileMetadataParams}             the FileMetadataParams instance
	 */
	private constructor(id: string) {
		this.id = id;
	}
}
