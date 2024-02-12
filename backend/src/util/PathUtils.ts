import { ConfigService } from '@nestjs/config';

import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { Environment } from 'src/config/EnvConfig';
import { StoragePath } from 'src/disk/DiskService';

/**
 * Utility class for path validation and normalization operations.
 * @class
 */
export class PathUtils {
	public static readonly MaxFileNameLength = 128;

	public static readonly MaxDirectoryNameLength = 128;

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
	 * Normalizes a directory path by replacing multiple slashes with a single forward slash.
	 * Leading slashes or dots (`../`, `./`, `/`) are removed, a single trailing slash is ensured.
	 *
	 * @param   {string} pathToNormalize the path to normalize
	 * @returns {string}                 the normalized path
	 */
	public static normalizeDirectoryPath(pathToNormalize: string): string {
		let result = path.normalize(pathToNormalize + '/');

		result = result.replaceAll(/\s+/g, ' ');
		result = result.replaceAll(/[\/\\]+/g, '/');
		result = result.replaceAll(/^\.{0,2}[\/\\]/g, '');

		return result;
	}

	/**
	 * Normalizes a file path by replacing multiple slashes with a single forward slash.
	 * Leading slashes or dots (`../`, `./`, `/`) are removed.
	 *
	 * @param   {string} pathToNormalize the path to normalize
	 * @returns {string}                 the normalized path
	 */
	public static normalizeFilePath(pathToNormalize: string): string {
		let result = path.normalize(pathToNormalize);

		result = result.replaceAll(/\s+/g, ' ');
		result = result.replaceAll(/[\/\\]+/g, '/');
		result = result.replaceAll(/^\.{0,2}[\/\\]/g, '');

		return result;
	}

	/**
	 * Prepare a path for file system operations by replacing all slashes with one single `/` or `\` depending on the OS.
	 *
	 * @param   {string} pathToPrepare the path to prepare
	 * @returns {string}               the prepared path
	 */
	public static prepareForFS(pathToPrepare: string): string {
		let result = PathUtils.normalizeFilePath(pathToPrepare);

		result = result.replaceAll(/[\/\\]+/g, path.sep);

		return result;
	}

	/**
	 * Checks if a path exists on the file system by using `fs.access`.
	 *
	 * @param   {string}  path the absolute path to check
	 * @returns {boolean}      whether the path exists
	 */
	public static async pathExists(path: string): Promise<boolean> {
		return (await fsPromises.access(path).catch(() => false)) === undefined;
	}

	/**
	 * Checks if a path does not leave the storage directory.
	 *
	 * @param   {string} relativePath the path relative to the storage location to check
	 * @returns {string}              whether the path leaves the storage directory
	 */
	public static isPathRelative(configService: ConfigService, relativePath: string): boolean {
		const diskPath: string = path.join(configService.getOrThrow(Environment.StoragePath), StoragePath.Data);
		const relative = path.relative(diskPath, path.join(diskPath, relativePath));

		return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
	}

	/**
	 * Joins a path with the storage location.
	 *
	 * @param   {string} relativePath the path to join
	 * @returns {string} the absolute joined path
	 */
	public static join(configService: ConfigService, relativePath: string, storagePath: StoragePath): string {
		return path.join(configService.getOrThrow(Environment.StoragePath), storagePath, relativePath);
	}

	/**
	 * Converts a uuid to a directory path.
	 * The 1st and 2nd characters specify the name of the first directory,
	 * 3rd and 4th the name of the second directory and the rest the filename.
	 *
	 * @example
	 * ```ts
	 * const uuid = "ded9d04b-b18f-4bce-976d-7a36acb42eb9";
	 * PathUtils.uuidToDirPath(uuid); // returns "de/d9/d04b-b18f-4bce-976d-7a36acb42eb9"
	 * ```
	 *
	 * @param   {string} uuid the uuid to convert
	 * @returns {string}      the corresponding directory path
	 */
	public static uuidToDirPath(uuid: string): string {
		return uuid.match(/.{1,2}/g)!.reduce((acc, curr, ind) => (acc += ind === 1 || ind === 2 ? '/' + curr : curr));
	}

	/**
	 * Checks if the given path is a valid directory path.
	 *
	 * @param   {string}  path the path to check
	 * @returns {boolean}      whether the path is valid
	 */
	public static isDirectoryPathValid(path: string): boolean {
		return PathUtils.ValidDirectoryPathRegExp.test(path);
	}

	/**
	 * Checks if the given path is a valid file path.
	 *
	 * @param   {string}  path the path to check
	 * @returns {boolean}      whether the path is valid
	 */
	public static isFilePathValid(path: string): boolean {
		return PathUtils.ValidFilePathRegExp.test(path);
	}
}
