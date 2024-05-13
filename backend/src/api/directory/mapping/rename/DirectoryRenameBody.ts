import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryRenameBody {
	/**
	 * The path to rename the directory to.
	 * @type {string}
	 */
	@Matches(PathUtils.ValidDirectoryPathRegExp)
	@ApiProperty({
		example: '/new/path/to/directory',
		description: 'The path to rename the directory to',
		pattern: `${PathUtils.ValidDirectoryPathRegExp}`,
	})
	readonly newPath: string;

	/**
	 * Creates a new DirectoryRenameBody instance.
	 *
	 * @param   {string}              newPath the path to rename the directory to
	 * @returns {DirectoryRenameBody}         the DirectoryRenameBody instance
	 */
	private constructor(newPath: string) {
		this.newPath = newPath;
	}
}
