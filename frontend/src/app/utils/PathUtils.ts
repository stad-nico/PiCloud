export class PathUtils {
	public static ensureSlashes(path: string) {
		const parts = path.split('/').filter((part) => part !== '');

		return '/' + parts.join('/') + '/';
	}

	public static dirname(path: string) {
		return path.replace(/\/$/gim, '').split('/').slice(0, -1).join('/').concat('/');
	}

	public static basename(path: string) {
		return path.replace(/\/$/gim, '').split('/').at(-1);
	}

	public static parse(path: string) {
		return {
			name: PathUtils.basename(path),
			dir: PathUtils.dirname(path),
		};
	}
}
