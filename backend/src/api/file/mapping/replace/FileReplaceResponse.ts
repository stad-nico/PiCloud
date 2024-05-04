import { PathUtils } from 'src/util/PathUtils';

export class FileReplaceResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(path: string): FileReplaceResponse {
		return new FileReplaceResponse(PathUtils.normalizeFilePath(path));
	}
}
