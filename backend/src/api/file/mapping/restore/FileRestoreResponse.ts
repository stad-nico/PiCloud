import { PathUtils } from 'src/util/PathUtils';

export class FileRestoreResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(path: string): FileRestoreResponse {
		return new FileRestoreResponse(PathUtils.normalizeFilePath(path));
	}
}
