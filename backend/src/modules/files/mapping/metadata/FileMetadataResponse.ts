/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { File } from 'src/db/entities/file.entity';

export class FileMetadataResponse {
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

	private constructor(file: File) {
		this.id = file.id;
		this.name = file.name;
		this.mimeType = file.mimeType;
		this.size = file.size;
		this.createdAt = file.createdAt;
		this.updatedAt = file.updatedAt;
		this.parentId = file.parent.id;
		this.userId = file.user.id;
	}

	public static from(file: File): FileMetadataResponse {
		return new FileMetadataResponse(file);
	}
}
