import { DirectoryRestoreParams } from 'src/api/directory/mapping/restore/DirectoryRestoreParams';
import { ValidationError } from 'src/util/ValidationError';
import { validate } from 'uuid';

export class DirectoryRestoreDto {
	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}

	public static from(directorRestoreParams: DirectoryRestoreParams): DirectoryRestoreDto {
		if (!validate(directorRestoreParams.id)) {
			throw new ValidationError(`${directorRestoreParams.id} is not a valid uuid`);
		}

		return new DirectoryRestoreDto(directorRestoreParams.id);
	}
}
