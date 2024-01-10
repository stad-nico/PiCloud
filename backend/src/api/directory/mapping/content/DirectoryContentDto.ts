import { DirectoryContentParams } from 'src/api/directory/mapping/content/DirectoryContentParams';

export class DirectoryContentDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryContentParams: DirectoryContentParams) {
		return new DirectoryContentDto(directoryContentParams.path);
	}
}
