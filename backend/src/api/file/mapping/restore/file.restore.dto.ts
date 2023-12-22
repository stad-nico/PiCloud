import { FileRestoreParams } from 'src/api/file/mapping/restore';

export class FileRestoreDto {
	readonly uuid: string;

	private constructor(uuid: string) {
		this.uuid = uuid;
	}

	public static from(fileRestoreParams: FileRestoreParams): FileRestoreDto {
		return new FileRestoreDto(fileRestoreParams.id);
	}
}
