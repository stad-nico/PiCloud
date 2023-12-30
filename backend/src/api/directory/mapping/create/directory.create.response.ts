import { DirectoryCreateDto } from 'src/api/directory/mapping/create/directory.create.dto';

export class DirectoryCreateResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryCreateDto: DirectoryCreateDto): DirectoryCreateResponse {
		return new DirectoryCreateResponse(directoryCreateDto.path);
	}
}
