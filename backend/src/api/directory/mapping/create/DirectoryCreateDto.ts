import * as path from 'path';

import { DirectoryCreateParams } from 'src/api/directory/mapping/create/DirectoryCreateParams';
import { DirectoryNameTooLongException } from 'src/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryPathException } from 'src/exceptions/InvalidDirectoryPathException';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryCreateDto {
	/**
	 * The path of the directory to create.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryCreateDto instance.
	 * @private @constructor
	 *
	 * @param   {string}              path the path of the directory to create
	 * @returns {DirectoryCreateDto}       the DirectoryCreateDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryCreateDto instance from the http params.
	 * Throws if the path is not valid or the directory name is too long.
	 * @public @static
	 *
	 * @throws  {InvalidDirectoryPathException} if the directory path is invalid
	 * @throws  {DirectoryNameTooLongException} if the directory name is too long
	 *
	 * @param   {DirectoryCreateParams} directoryCreateParams the http params
	 * @returns {DirectoryCreateDto}                          the DirectoryCreateDto instance
	 */
	public static from(directoryCreateParams: DirectoryCreateParams): DirectoryCreateDto {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryCreateParams.path);

		if (!PathUtils.isDirectoryPathValid(normalizedPath)) {
			throw new InvalidDirectoryPathException(directoryCreateParams.path);
		}

		if (path.basename(normalizedPath).length > PathUtils.MaxDirectoryNameLength) {
			throw new DirectoryNameTooLongException(path.basename(normalizedPath));
		}

		return new DirectoryCreateDto(normalizedPath);
	}
}
