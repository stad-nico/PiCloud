import { DirectoryRenameDto } from 'src/api/directory/mapping/rename/directory.rename.dto';

export class DirectoryRenameResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryRenameDto: DirectoryRenameDto) {
		return new DirectoryRenameResponse(directoryRenameDto.destPath);
	}
}
