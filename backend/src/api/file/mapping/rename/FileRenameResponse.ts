import { PathUtils } from 'src/util/PathUtils';

export class FileRenameResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(path: string): FileRenameResponse {
		return new FileRenameResponse(PathUtils.normalizeFilePath(path));
	}
}
