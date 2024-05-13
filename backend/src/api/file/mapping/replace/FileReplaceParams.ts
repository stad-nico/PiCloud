import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the http request url params.
 * @class
 */
export class FileReplaceParams {
	/**
	 * The path of the file to replace.
	 * @type {string}
	 */
	@Matches(PathUtils.ValidFilePathRegExp)
	@ApiProperty({
		example: '/path/to/file.txt',
		description: 'The path of the file to replace',
		pattern: `${PathUtils.ValidFilePathRegExp}`,
	})
	readonly path: string;

	/**
	 * Creates a new FileReplaceParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                 path the path of the file
	 * @returns {FileReplaceParams}           the FileReplaceParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
