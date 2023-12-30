import { ConfigService } from '@nestjs/config';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { Environment } from 'src/env.config';

export class PathUtils {
	public static readonly validFileNameRegExp = `([-_.]?[a-zA-Z0-9])([-_. ]?[a-zA-Z0-9])`;

	public static readonly validDirectoryPathRegExp = new RegExp(`^(${this.validFileNameRegExp}\/)*(${this.validFileNameRegExp}\/?)$`, 'm');

	/**
	 * A/B F/C/
	 *
	 * @param pathToNormalize
	 * @returns
	 */
	public static normalize(pathToNormalize: string): string {
		let result = path.normalize(pathToNormalize + '/');

		result = result.replaceAll(/\s+/, ' ');
		result = result.replaceAll(/[\/\\]+/, path.sep);
		result = result.replaceAll(/^\.{0,2}[\/\\]/, '');

		return result;
	}
	/**
	 * Normalizes a path for the current os by replacing / or \ with `path.sep`
	 *
	 * @param pathToNormalize the path to normalize
	 * @returns the normalized path
	 */
	private static normalizePathForOS(pathToNormalize: string): string {
		return pathToNormalize.replaceAll(/(\/|\\)/gi, path.sep);
	}

	/**
	 * Checks if a path exists on the fs by normalizing the path first and then using `fs.access`
	 *
	 * @param path the absolute path to check
	 * @returns true if the path exists, otherwise false
	 */
	public static async pathExists(path: string): Promise<boolean> {
		return (await fsPromises.access(PathUtils.normalizePathForOS(path)).catch(() => false)) === undefined;
	}

	/**
	 * Checks if a path does not leave the directory specified in `env.DISK_STORAGE_PATH` by joining it with `DISK_STORAGE_PATH`
	 *
	 * @example
	 * process.env.DISK_STORAGE_PATH = "C:/test";
	 * isPathRelative("t.txt"); // returns true
	 * isPathRelative("../../f.txt"); // returns false
	 *
	 * @param relativePath the path relative to `DISK_STORAGE_PATH` to check
	 * @returns
	 */
	public static isPathRelative(configService: ConfigService, relativePath: string): boolean {
		const diskPath: string = configService.getOrThrow(Environment.DiskStoragePath);
		const relative = path.relative(diskPath, path.join(diskPath, relativePath));

		return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
	}

	/**
	 * Joins a path with the environment variable `env` and returns normalized path
	 *
	 * @param relativePath the path to join
	 * @returns the absolute and normalized path
	 */
	public static join(configService: ConfigService, relativePath: string, env: Environment): string {
		return path.join(configService.getOrThrow(env), relativePath);
	}

	public static uuidToDirPath(uuid: string): string {
		return uuid.match(/.{1,2}/g)!.reduce((acc, curr, ind) => (acc += ind === 1 || ind === 2 ? '/' + curr : curr));
	}

	public static isValidDirectoryPath(path: string): boolean {
		return PathUtils.validDirectoryPathRegExp.test(path);
	}
}
