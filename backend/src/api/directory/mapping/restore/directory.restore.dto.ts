import { DirectoryRestoreParams } from 'src/api/directory/mapping/restore/directory.restore.params';
import { ValidationError } from 'src/util/ValidationError';
import { validate } from 'uuid';

export class DirectoryRestoreDto {
	readonly uuid: string;

	private constructor(uuid: string) {
		this.uuid = uuid;
	}

	public static from(directorRestoreParams: DirectoryRestoreParams): DirectoryRestoreDto {
		if (!validate(directorRestoreParams.uuid)) {
			throw new ValidationError('');
		}

		return new DirectoryRestoreDto(directorRestoreParams.uuid);
	}
}
