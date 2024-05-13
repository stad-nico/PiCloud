import { ApiProperty } from '@nestjs/swagger';
import { File } from 'src/db/entities/File';
import { PathUtils } from 'src/util/PathUtils';

type FileMetadataResponseType = Pick<File, 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> & { path: string };

/**
 * Class representing the json http response.
 * @class
 */
export class FileMetadataResponse {
	/**
	 * The name of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The name of the file', type: 'string', example: 'file.txt' })
	readonly name: string;

	/**
	 * The path of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The path of the file', type: 'string', example: '/path/to/file.txt' })
	readonly path: string;

	/**
	 * The mime type of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The name of the file', type: 'string', format: 'MimeType', example: 'text/plain' })
	readonly mimeType: string;

	/**
	 * The size of the file in bytes.
	 * @type {number}
	 */
	@ApiProperty({ description: 'The size of the file in bytes', type: 'number', example: 1182 })
	readonly size: number;

	/**
	 * The creation date of the file.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the file was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly created: string;

	/**
	 * The date the file was last modified.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The date the file was last modified', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly updated: string;

	/**
	 * Creates a new FileMetadataResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                    name        the name
	 * @param   {string}                    path        the path
	 * @param   {string}                    mimeType    the mime type
	 * @param   {number}                    size        the size
	 * @param   {string}                    createdAt   the creation date
	 * @param   {string}                    updatedAt   the last updated date
	 * @returns {FileMetadataResponse}                  the FileMetadataResponse instance
	 */
	private constructor(name: string, path: string, mimeType: string, size: number, created: string, updated: string) {
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
		this.created = created;
		this.updated = updated;
	}

	/**
	 * Creates a new FileMetadataResponse instance from the metadata.
	 * @public @static
	 *
	 * @param   {FileMetadataResponseType} obj the metadata of the file
	 * @returns {FileMetadataResponse}         the FileMetadataResponse instance
	 */
	public static from(obj: FileMetadataResponseType): FileMetadataResponse {
		return new FileMetadataResponse(
			obj.name,
			PathUtils.normalizeFilePath(obj.path),
			obj.mimeType,
			obj.size,
			obj.createdAt.toISOString(),
			obj.updatedAt.toISOString()
		);
	}
}
