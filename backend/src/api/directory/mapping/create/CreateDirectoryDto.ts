import { CreateDirectoryParams } from 'src/api/directory/classes/create/CreateDirectoryParams';

export class CreateDirectoryDto {
	private readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(createDirectoryParams: CreateDirectoryParams) {
		return new CreateDirectoryDto(createDirectoryParams.getPath());
	}
}
