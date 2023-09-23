import * as fs from 'fs/promises';
import * as path from 'path';
import { InjectEnv } from 'src/env/InjectEnv';

export class FileUtils {
	@InjectEnv('DISK_PATH')
	private static DISK_PATH: string;

	public static async pathExists(path: string): Promise<boolean> {
		return fs.access(path).catch(() => false) === undefined;
	}

	public static isPathRelative(relativePath: string): boolean {
		const relative = path.relative(FileUtils.DISK_PATH, path.join(FileUtils.DISK_PATH, relativePath));
		return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
	}

	public static resolve(relativePath: string): string {
		return path.resolve(FileUtils.DISK_PATH, relativePath);
	}
}
