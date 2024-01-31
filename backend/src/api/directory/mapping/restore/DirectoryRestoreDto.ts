import { DirectoryRestoreParams } from 'src/api/directory/mapping/restore/DirectoryRestoreParams';
import { ValidationError } from 'src/util/ValidationError';
import { validate } from 'uuid';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryRestoreDto {
	/**
	 * The id of the directory to restore.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new DirectoryRestoreDto instance.
	 * @private @constructor
	 *
	 * @param   {string}              id the id of the directory to restore
	 * @returns {DirectoryRestoreDto}    the DirectoryRestoreDto instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new DirectoryRestoreDto instance from the http params.
	 * Throws if the given params are not valid.
	 * @public @static
	 *
	 * @throws  {ValidationError} the id must be a valid v4 uuid
	 *
	 * @param   {DirectoryRestoreParams} directoryRestoreParams the http params
	 * @returns {DirectoryRestoreDto}                           the DirectoryRestoreDto instance
	 */
	public static from(directoryRestoreParams: DirectoryRestoreParams): DirectoryRestoreDto {
		if (!validate(directoryRestoreParams.id)) {
			throw new ValidationError(`${directoryRestoreParams.id} is not a valid id`);
		}

		return new DirectoryRestoreDto(directoryRestoreParams.id);
	}
}
