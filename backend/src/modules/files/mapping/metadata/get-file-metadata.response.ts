/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { File } from 'src/db/entities/file.entity';

export class GetFileMetadataResponse {
	@ApiProperty({ description: 'The id of the file', type: 'string', example: '133a8736-111a-4cf7-ae84-dbe040ad4382' })
	readonly id: string;

	@ApiProperty({ description: 'The name of the file', type: 'string', example: 'file.txt' })
	readonly name: string;

	@ApiProperty({ description: 'The name of the file', type: 'string', format: 'MimeType', example: 'text/plain' })
	readonly mimeType: string;

	@ApiProperty({ description: 'The size of the file in bytes', type: 'number', example: 1182 })
	readonly size: number;

	@ApiProperty({ description: 'The date the file was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt: Date;

	@ApiProperty({ description: 'The date the file was last modified', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly updatedAt: Date;

	@ApiProperty({ description: 'The id of the files directory', type: 'string', example: 'd9f1e2a3-aaaa-bbbb-cccc-445566778899' })
	readonly parentId: string;

	@ApiProperty({ description: 'The id of the files user', type: 'string', example: 'c3b3e2a5-d94f-4a49-b826-112233445566' })
	readonly userId: string;

	@ApiProperty({ description: 'The absolute path of the directory', type: 'string', example: '/home/user/photos' })
	readonly path: string;

	@ApiProperty({
		description: 'The chain of ids',
		type: 'string',
		isArray: true,
		example: "['2c3f4a65-7d61-4532-b9ea-e1b5537f0bcf', '2c3f4a65-7d61-4532-b9ea-e1b5537f0bcf', '2c3f4a65-7d61-4532-b9ea-e1b5537f0bcf']",
	})
	readonly idChain: string[];

	private constructor(file: File, path: string, idChain: Array<string>) {
		this.id = file.id;
		this.name = file.name;
		this.mimeType = file.mimeType;
		this.size = file.size;
		this.createdAt = file.createdAt;
		this.updatedAt = file.updatedAt;
		this.parentId = file.parent.id;
		this.userId = file.user.id;
		this.path = path;
		this.idChain = idChain;
	}

	public static from(file: File, path: string, idChain: Array<string>): GetFileMetadataResponse {
		return new GetFileMetadataResponse(file, path, idChain);
	}
}
