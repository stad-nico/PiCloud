import { DirectoryRenameDto } from 'src/api/directory/mapping/rename/DirectoryRenameDto';

export class DirectoryRenameResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryRenameDto: DirectoryRenameDto) {
		return new DirectoryRenameResponse(directoryRenameDto.destPath);
	}
}
