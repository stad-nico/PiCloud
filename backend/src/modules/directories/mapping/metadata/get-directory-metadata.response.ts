/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { DirectoryMetadata } from 'src/modules/directories/directory.repository';

export class GetDirectoryMetadataResponse {
	@ApiProperty({ description: 'The id of the directory', type: 'string', example: '2c3f4a65-7d61-4532-b9ea-e1b5537f0bcf' })
	readonly id: string;

	@ApiProperty({ description: 'The name of the directory', type: 'string', example: 'photos' })
	readonly name: string;

	@ApiProperty({ description: 'The size of the directory in bytes', type: 'number', example: 1193982 })
	readonly size: number;

	@ApiProperty({ description: 'The amount of files this directory and each subdirectory contains in total', type: 'number', example: 42 })
	readonly files: number;

	@ApiProperty({ description: 'The amount of subdirectories this directory contains in total', type: 'number', example: 9 })
	readonly directories: number;

	@ApiProperty({ description: 'The date the directory was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt: Date;

	@ApiProperty({
		description: 'The date the directory was last modified',
		type: 'string',
		nullable: true,
		format: 'Date',
		example: '2024-05-05 17:37:33',
	})
	readonly updatedAt: Date;

	@ApiProperty({ description: 'The parentId of the directory', type: 'string', example: '024eb278-6ebf-11ef-9656-98fc84e066e5' })
	readonly parentId: string | null;

	@ApiProperty({ description: 'The userId of the directory', type: 'string', example: '85dff44c-8a73-4804-abfe-b7352d8cfbea' })
	readonly userId: string;

	private constructor(metadata: DirectoryMetadata) {
		this.id = metadata.id;
		this.parentId = metadata.parentId;
		this.name = metadata.name;
		this.size = metadata.size;
		this.files = metadata.files;
		this.directories = metadata.directories;
		this.createdAt = metadata.createdAt;
		this.updatedAt = metadata.updatedAt;
		this.userId = metadata.userId;
	}

	public static from(metadata: DirectoryMetadata): GetDirectoryMetadataResponse {
		return new GetDirectoryMetadataResponse(metadata);
	}
}
