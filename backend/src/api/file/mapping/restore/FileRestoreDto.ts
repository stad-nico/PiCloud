import { FileRestoreParams } from 'src/api/file/mapping/restore';
import { ValidationError } from 'src/util/ValidationError';
import { validate } from 'uuid';

export class FileRestoreDto {
	readonly uuid: string;

	private constructor(uuid: string) {
		this.uuid = uuid;
	}

	public static from(fileRestoreParams: FileRestoreParams): FileRestoreDto {
		if (!validate(fileRestoreParams.uuid)) {
			throw new ValidationError(`${fileRestoreParams.uuid} is not a valid uuid`);
		}

		return new FileRestoreDto(fileRestoreParams.uuid);
	}
}
