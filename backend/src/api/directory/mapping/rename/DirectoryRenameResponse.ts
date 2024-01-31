import { DirectoryRenameDto } from 'src/api/directory/mapping/rename/DirectoryRenameDto';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryRenameResponse {
	/**
	 * The path of the directory after renaming.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryRenameResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the directory after renaming
	 * @returns {DirectoryRenameResponse}      the DirectoryRenameResponse instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryRenameResponse instance from the dto.
	 * @public @static
	 *
	 * @param   {DirectoryRenameDto}      directoryRenameDto the DirectoryRenameDto
	 * @returns {DirectoryRenameResponse}                    the DirectoryRenameResponse instance
	 */
	public static from(directoryRenameDto: DirectoryRenameDto) {
		return new DirectoryRenameResponse(PathUtils.normalizeDirectoryPath(directoryRenameDto.destPath));
	}
}
