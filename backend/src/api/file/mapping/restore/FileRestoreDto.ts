import { FileRestoreParams } from 'src/api/file/mapping/restore';
import { ValidationError } from 'src/util/ValidationError';
import { validate } from 'uuid';

export class FileRestoreDto {
	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}

	public static from(fileRestoreParams: FileRestoreParams): FileRestoreDto {
		if (!validate(fileRestoreParams.id)) {
			throw new ValidationError(`${fileRestoreParams.id} is not a valid id`);
		}

		return new FileRestoreDto(fileRestoreParams.id);
	}
}
