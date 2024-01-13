import { ConfigService } from '@nestjs/config';

import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { StoragePath } from 'src/disk/DiskService';
import { Environment } from 'src/EnvConfig';

/**
 * Utility class for path operations
 */
export class PathUtils {
	public static readonly ValidChars = `[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df]`;

	public static readonly ValidDirectoryNameRegExp = `([-_.]?${PathUtils.ValidChars})([-_. ]?${PathUtils.ValidChars})*`;

	public static readonly ValidFileNameRegExp = `([-_. ]?${PathUtils.ValidChars})*(\\\.${PathUtils.ValidChars}+)`;

	public static readonly ValidDirectoryPathRegExp = new RegExp(
		`^(${PathUtils.ValidDirectoryNameRegExp}[\\/\\\\])*(${PathUtils.ValidDirectoryNameRegExp}[\\/\\\\]?)$`,
		'm'
	);

	public static readonly ValidFilePathRegExp = new RegExp(
		`^(${PathUtils.ValidDirectoryNameRegExp}[\\/\\\\])*(${PathUtils.ValidFileNameRegExp})$`,
		'm'
	);

	/**
	 * Normalize a directory path by replacing multiple slashes with a single forward slash.
	 * Leading slashes or dots (`../`, `./`, `/`) are removed, a single trailing slash is ensured.
	 *
	 * @param {string} pathToNormalize - the path to normalize
	 * @returns {string} the normalized path
	 */
	public static normalizeDirectoryPath(pathToNormalize: string): string {
		let result = path.normalize(pathToNormalize + '/');

		result = result.replaceAll(/\s+/g, ' ');
		result = result.replaceAll(/[\/\\]+/g, '/');
		result = result.replaceAll(/^\.{0,2}[\/\\]/g, '');

		return result;
	}

	/**
	 * Normalize a file path by replacing multiple slashes with a single forward slash.
	 * Leading slashes or dots (`../`, `./`, `/`) are removed.
	 *
	 * @param {string} pathToNormalize - the path to normalize
	 * @returns {string} the normalized path
	 */
	public static normalizeFilePath(pathToNormalize: string): string {
		let result = path.normalize(pathToNormalize);

		result = result.replaceAll(/\s+/g, ' ');
		result = result.replaceAll(/[\/\\]+/g, '/');
		result = result.replaceAll(/^\.{0,2}[\/\\]/g, '');

		return result;
	}

	/**
	 * Prepare a path for fs by replacing all slashes with one single `/` or `\` depending on the OS
	 *
	 * @param {string} pathToPrepare - the path to prepare
	 * @returns {string} the prepared path
	 */
	public static prepareForFS(pathToPrepare: string): string {
		let result = PathUtils.normalizeFilePath(pathToPrepare);

		result = result.replaceAll(/[\/\\]+/g, path.sep);

		return result;
	}

	/**
	 * Check if a path exists on the fs by using `fs.access`
	 *
	 * @param {string} path the absolute path to check
	 * @returns {boolean} true if the path exists, otherwise false
	 */
	public static async pathExists(path: string): Promise<boolean> {
		return (await fsPromises.access(path).catch(() => false)) === undefined;
	}

	/**
	 * Check if a path does not leave the directory specified in `env.DISK_STORAGE_PATH` by joining it with `DISK_STORAGE_PATH`
	 *
	 * @example
	 * ```js
	 * process.env.DISK_STORAGE_PATH = "C:/test";
	 *
	 * isPathRelative("t.txt"); // returns true
	 * isPathRelative("../../f.txt"); // returns false
	 * ```
	 *
	 * @param {string} relativePath the path relative to `DISK_STORAGE_PATH` to check
	 * @returns {string} whether the path is relative
	 */
	public static isPathRelative(configService: ConfigService, relativePath: string): boolean {
		const diskPath: string = path.join(configService.getOrThrow(Environment.StoragePath), StoragePath.Data);
		const relative = path.relative(diskPath, path.join(diskPath, relativePath));

		return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
	}

	/**
	 * Join a path with the storage location
	 *
	 * @param {string} relativePath the path to join
	 * @returns {string} the absolute joined path
	 */
	public static join(configService: ConfigService, relativePath: string, storagePath: StoragePath): string {
		return path.join(configService.getOrThrow(Environment.StoragePath), storagePath, relativePath);
	}

	/**
	 * Convert a uuid to a directory path.
	 * The first two chars specify the name of the first directory, the second two chars the name of the second directory
	 * and the rest the filename.
	 *
	 * @example
	 * const uuid = "ded9d04b-b18f-4bce-976d-7a36acb42eb9";
	 * PathUtils.uuidToDirPath(uuid); // returns "de/d9/d04b-b18f-4bce-976d-7a36acb42eb9"
	 *
	 * @param {string} uuid - the uuid to convert
	 * @returns {string} the corresponding directory path
	 */
	public static uuidToDirPath(uuid: string): string {
		return uuid.match(/.{1,2}/g)!.reduce((acc, curr, ind) => (acc += ind === 1 || ind === 2 ? '/' + curr : curr));
	}

	/**
	 * Check if the given path is a valid directory path
	 *
	 * @param {string} path - the path to check
	 * @returns {boolean} whether the path is valid
	 */
	public static isValidDirectoryPath(path: string): boolean {
		return PathUtils.ValidDirectoryPathRegExp.test(path);
	}

	public static isValidFilePath(path: string): boolean {
		return true;
	}
}
