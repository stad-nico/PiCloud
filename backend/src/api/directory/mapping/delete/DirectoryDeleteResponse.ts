/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryDeleteResponse {
	/**
	 * The id of the deleted directory.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new DirectoryDeleteResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  id the id of the directory
	 * @returns {DirectoryDeleteResponse}    the DirectoryDeleteResponse instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new DirectoryDeleteResponse instance from the id.
	 * @public @static
	 *
	 * @param   {string}                  id the id of the created directory
	 * @returns {DirectoryDeleteResponse}    the DirectoryDeleteResponse instance
	 */
	public static from(id: string) {
		return new DirectoryDeleteResponse(id);
	}
}
