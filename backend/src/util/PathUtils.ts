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

type File = { id: string; name: string; parentId: string };
type Directory = { id: string; name: string; parentId: string | null };

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
	 * The regular expression for matching a directory name.
	 * @type {RegExp}
	 */
	public static readonly ValidDirectoryNameRegExp =
		/^([-_.]?[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df])([-_. ]?[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df])*$/m;

	/**
	 * The regular expression for matching a file name.
	 * @type {RegExp}
	 */
	public static readonly ValidFileNameRegExp =
		/^([-_. ]?[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df])*(\.[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df]+)$/m;

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
	 * Validates a directory name.
	 *
	 * @param   {string}  name the directory name
	 * @returns {boolean}      whether the directory name is valid
	 */
	public static isDirectoryNameValid(name: string): boolean {
		return PathUtils.ValidDirectoryNameRegExp.test(name);
	}

	/**
	 * Validates the length of a directory name.
	 *
	 * @param   {string}  name the directory name
	 * @returns {boolean}      whether the length of the directory name is valid
	 */
	public static isDirectoryNameLengthValid(name: string): boolean {
		return PathUtils.MaxDirectoryNameLength >= name.length;
	}

	/**
	 * Validates a file name.
	 *
	 * @param   {string}  name the file name
	 * @returns {boolean}      whether the file name is valid
	 */
	public static isFileNameValid(name: string): boolean {
		return PathUtils.ValidFileNameRegExp.test(name);
	}

	/**
	 * Validates the length of a file name.
	 *
	 * @param   {string}  name the file name
	 * @returns {boolean}      whether the length of the file name is valid
	 */
	public static isFileNameLengthValid(name: string): boolean {
		return PathUtils.MaxFileNameLength >= name.length;
	}

	/**
	 * Builds the file paths relative to the root
	 *
	 * @param   {string}           rootId      the id of the directory root
	 * @param   {Array<File>}      files       the files the directory contains
	 * @param   {Array<Directory>} directories the subdirectories the root contains
	 * @returns {Array<{ id: string; relativePath: string }>} the relative paths
	 */
	public static buildFilePaths(rootId: string, files: Array<File>, directories: Array<Directory>): Array<{ id: string; relativePath: string }> {
		const directoryPathMap = new Map([[rootId, '/']]);

		const getPath: (fileOrDirectory: any) => string = (fileOrDirectory: File | Directory) => {
			if (!fileOrDirectory.parentId) {
				return directoryPathMap.get(rootId)!;
			}

			if (directoryPathMap.has(fileOrDirectory.parentId)) {
				const path = directoryPathMap.get(fileOrDirectory.parentId) + '/' + fileOrDirectory.name;
				directoryPathMap.set(fileOrDirectory.id, path);
				return path;
			}

			const next =
				files.find((file) => file.id === fileOrDirectory.parentId) || directories.find((directory) => directory.id === fileOrDirectory.parentId);

			if (!next) {
				throw new Error('parent not represented');
			}

			return getPath(next) + '/' + fileOrDirectory.name;
		};

		return files.map((file) => ({ id: file.id, relativePath: getPath(file) }));
	}
}
