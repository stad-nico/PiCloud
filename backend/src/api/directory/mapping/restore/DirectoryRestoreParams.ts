import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryRestoreParams {
	/**
	 * The id of the directory to restore.
	 * @type {string}
	 */
	@IsNotEmpty()
	@IsString()
	@IsUUID()
	readonly id: string;

	/**
	 * Creates a new DirectoryRestoreParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                 id the id of the directory to restore
	 * @returns {DirectoryRestoreParams}    the DirectoryRestoreParams instance
	 */
	private constructor(id: string) {
		this.id = id;
	}
}
