import { PathUtils } from 'src/util/PathUtils';

export class DirectoryCreateResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(path: string): DirectoryCreateResponse {
		return new DirectoryCreateResponse(PathUtils.normalizeDirectoryPath(path));
	}
}
