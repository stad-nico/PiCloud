/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

export class DirectoryContentFile {
	@ApiProperty({ description: 'The id of the file', type: 'string', example: '133a8736-111a-4cf7-ae84-dbe040ad4382' })
	readonly id!: string;

	@ApiProperty({ description: 'The name of the file', type: 'string', example: 'file.txt' })
	readonly name!: string;

	@ApiProperty({ description: 'The mime type of the file', type: 'string', example: 'file.txt' })
	readonly mimeType!: string;

	@ApiProperty({ description: 'The size of the file in bytes', type: 'number', example: 1193982 })
	readonly size!: number;

	@ApiProperty({ description: 'The date the file was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt!: Date;

	@ApiProperty({ description: 'The date the file was last modified', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly updatedAt!: Date;
}

export class DirectoryContentDirectory {
	@ApiProperty({ description: 'The id of the directory', type: 'string', example: '133a8736-111a-4cf7-ae84-dbe040ad4382' })
	readonly id!: string;

	@ApiProperty({ description: 'The name of the directory', type: 'string', example: 'photos' })
	readonly name!: string;

	@ApiProperty({ description: 'The size of the directory in bytes', type: 'number', example: 1193982 })
	readonly size!: number;

	@ApiProperty({ description: 'Whether the directory has subdirectories', type: 'boolean', example: true })
	readonly hasSubdirectories!: boolean;

	@ApiProperty({ description: 'The date the directory was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt!: Date;

	@ApiProperty({
		description: 'The date the directory was last modified',
		type: 'string',
		format: 'Date',
		example: '2024-05-05 17:37:33',
	})
	readonly updatedAt!: Date;
}

export class GetDirectoryContentsResponse {
	@ApiProperty({ type: [DirectoryContentFile] })
	readonly files: Array<DirectoryContentFile>;

	@ApiProperty({ type: [DirectoryContentDirectory] })
	readonly directories: Array<DirectoryContentDirectory>;

	private constructor(files: Array<DirectoryContentFile>, directories: Array<DirectoryContentDirectory>) {
		this.files = files;
		this.directories = directories;
	}

	public static from(files: Array<DirectoryContentFile>, directories: Array<DirectoryContentDirectory>): GetDirectoryContentsResponse {
		return new GetDirectoryContentsResponse(files, directories);
	}
}
