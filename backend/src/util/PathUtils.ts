/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { ConfigService } from '@nestjs/config';

import { Environment } from 'src/config/EnvConfig';
import { StoragePath } from 'src/disk/DiskService';

/**
 * Utility class for path validation and normalization operations.
 * @class
 */
export class PathUtils {
	/**
	 * The maximum length of a file name.
	 * @type {number}
	 */
	public static readonly MaxFileNameLength = 64;

	/**
	 * The maximum length of a directory name.
	 * @type {number}
	 */
	public static readonly MaxDirectoryNameLength = 64;

	/**
	 * The regular expression string for matching characters.
	 * Includes umlauts Ä (\u00c4), ä (\u00e4), Ö (\u00d6), ö (\u00f6), Ü (u00dc), ü (u00fc) and ß (\u00df).
	 * @type {string}
	 */
	public static readonly ValidChars = `[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df]`;

	/**
	 * The regular expression string for matching a directory name.
	 * @type {string}
	 */
	public static readonly ValidDirectoryNameRegExp = `([-_.]?${PathUtils.ValidChars})([-_. ]?${PathUtils.ValidChars})*`;

	/**
	 * The regular expression string for matching a file name.
	 * @type {string}
	 */
	public static readonly ValidFileNameRegExp = `([-_. ]?${PathUtils.ValidChars})*(\\\.${PathUtils.ValidChars}+)`;

	/**
	 * The regular expression for matching a directory path.
	 * @type {RegExp}
	 */
	public static readonly ValidDirectoryPathRegExp = new RegExp(
		`^([\\/\\\\]?root[\\/\\\\]?|[\\/\\\\]?root[\\/\\\\]?(${PathUtils.ValidDirectoryNameRegExp}[\\/\\\\])*(${PathUtils.ValidDirectoryNameRegExp}[\\/\\\\]?))$`,
		'm'
	);

	/**
	 * The regular expression for matching a file path.
	 * @type {RegExp}
	 */
	public static readonly ValidFilePathRegExp = new RegExp(
		`^[\\/\\\\]?root[\\/\\\\]?(${PathUtils.ValidDirectoryNameRegExp}[\\/\\\\])*(${PathUtils.ValidFileNameRegExp})$`,
		'm'
	);

	/**
	 * Normalizes a directory path by replacing multiple slashes with a single forward slash.
	 * Leading slashes or dots (`../`, `./`, `/`) are replaced by a single leading slash, a single trailing slash is ensured.
	 * Relative paths are converted to absolute paths.
	 *
	 * @param   {string} pathToNormalize the path to normalize
	 * @returns {string}                 the normalized path
	 */
	public static normalizeDirectoryPath(pathToNormalize: string): string {
		let result = path.normalize('/' + decodeURIComponent(pathToNormalize) + '/');

		result = result.replaceAll(/\s+/g, ' ');
		result = result.replaceAll(/^\.{0,2}[\/\\]/g, '/');
		result = result.replaceAll(/[\/\\]+/g, '/');

		return result;
	}

	/**
	 * Normalizes a file path by replacing multiple slashes with a single forward slash.
	 * Leading slashes or dots (`../`, `./`, `/`) are replaced by a single leading slash.
	 * Trailing slashes are removed.
	 * Relative paths are converted to absolute paths.
	 *
	 * @param   {string} pathToNormalize the path to normalize
	 * @returns {string}                 the normalized path
	 */
	public static normalizeFilePath(pathToNormalize: string): string {
		let result = path.normalize('/' + decodeURIComponent(pathToNormalize));

		result = result.replaceAll(/\s+/g, ' ');
		result = result.replaceAll(/^\.{0,2}[\/\\]/g, '/');
		result = result.replaceAll(/[\/\\]+/g, '/');
		result = result.replaceAll(/\/$/g, '');

		return result;
	}

	/**
	 * Prepare a path for file system operations by replacing all slashes with one single `/` or `\` depending on the OS.
	 * Relative paths are converted to absolute paths.
	 *
	 * @param   {string} pathToPrepare the path to prepare
	 * @returns {string}               the prepared path
	 */
	public static prepareFilePathForFS(pathToPrepare: string): string {
		const isWindows = process.platform === 'win32';
		const driveNameMatch = pathToPrepare.match(/^[A-Z]:/gim);
		const driveName = isWindows && driveNameMatch ? driveNameMatch[0] : '';

		const relativePath = pathToPrepare.replace(driveName, '');

		let result = path.join(driveName, PathUtils.normalizeFilePath(relativePath));

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
	 * Joins a path with the storage location provided in the env variable `STORAGE_PATH`.
	 *
	 * @param {StoragePath} storagePath  the storage path
	 * @param      {string} relativePath the path to join
	 * @returns    {string}              the absolute joined path
	 */
	public static join(configService: ConfigService, storagePath: StoragePath, relativePath: string): string {
		return path.join(configService.getOrThrow(Environment.StoragePath), storagePath, relativePath);
	}

	/**
	 * Converts a uuid to a directory path.
	 * The first and second characters specify the name of the first directory,
	 * third and fourth the name of the second directory and the rest the filename.
	 *
	 * @example
	 * ```ts
	 * const uuid = 'ded9d04b-b18f-4bce-976d-7a36acb42eb9';
	 * PathUtils.uuidToDirPath(uuid); // returns de/d9/d04b-b18f-4bce-976d-7a36acb42eb9
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
