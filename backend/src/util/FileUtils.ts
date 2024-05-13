/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Archiver, ArchiverError, create as createArchiver } from 'archiver';
import { createReadStream } from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';

import { ConfigService } from '@nestjs/config';

import { StoragePath } from 'src/disk/DiskService';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Utility class for operations on the file system.
 * @class
 */
export class FileUtils {
	/**
	 * Tries to delete the directory recursively.
	 * Throws an error if it fails.
	 *
	 * @param {string}  path			 the absolute path
	 * @param {boolean} [recursive=true] whether subfolders should get deleted
	 */
	public static async deleteDirectoryOrFail(path: string, recursive: boolean = true): Promise<void> {
		return await fsPromises.rm(path, { recursive: recursive });
	}

	/**
	 * Tries to create the directory recursively if it does not already exist.
	 * Throws an error if it fails.
	 *
	 * @param {string}  path             the absolute path
	 * @param {boolean} [recursive=true] whether subfolders should be created
	 */
	public static async createDirectoryIfNotPresent(path: string, recursive: boolean = true): Promise<void> {
		if (await PathUtils.pathExists(path)) {
			return;
		}

		await fsPromises.mkdir(path, { recursive: recursive });
	}

	/**
	 * Writes a file stream to the disk.
	 *
	 * @param {string}   absolutePath     the destination path
	 * @param {Readable} stream           the file stream
	 * @param {boolean}  [recursive=true] whether destination path should be created if it does not exist
	 */
	public static async writeFile(absolutePath: string, stream: Readable, recursive: boolean = true): Promise<void> {
		const normalizedPath = PathUtils.prepareFilePathForFS(absolutePath);

		if (recursive) {
			const parentPath = PathUtils.prepareFilePathForFS(path.dirname(normalizedPath));

			if (!(await PathUtils.pathExists(parentPath))) {
				await fsPromises.mkdir(parentPath, { recursive: true });
			}
		}

		await fsPromises.writeFile(normalizedPath, stream);
	}

	/**
	 * Copies a file.
	 *
	 * @param {string}  from             the source path
	 * @param {string}  to               the destination path
	 * @param {boolean} [recursive=true] whether destination path should be created if it does not exist
	 */
	public static async copyFile(from: string, to: string, recursive: boolean = true): Promise<void> {
		const fromNormalized = PathUtils.prepareFilePathForFS(from);
		const toNormalized = PathUtils.prepareFilePathForFS(to);

		if (recursive) {
			if (!(await PathUtils.pathExists(path.dirname(toNormalized)))) {
				await fsPromises.mkdir(path.dirname(toNormalized), { recursive: true });
			}
		}

		await fsPromises.copyFile(fromNormalized, toNormalized);
	}

	/**
	 * Empties a directory by removing all files and subfolders from it.
	 *
	 * @param {string} absolutePath the directory path
	 */
	public static async emptyDirectory(absolutePath: string): Promise<void> {
		const files = await fsPromises.readdir(absolutePath);

		for (const file of files) {
			await fsPromises.rm(path.join(absolutePath, file), { recursive: true });
		}
	}

	/**
	 * Creates a read stream of a ZIP-Archive.
	 * Each file is loaded from the fs by its id and stored in the archive under its path.
	 *
	 * @param   {ConfigService}                       configService the config service
	 * @param   {Array<{ id: string; path: string }>} files         the files
	 * @returns {Readable}                                          readable stream
	 */
	public static async createZIPArchive(configService: ConfigService, files: Array<{ id: string; path: string }>): Promise<Readable> {
		return new Promise<Archiver>((resolve, reject) => {
			const archive = createArchiver('zip');

			const errorHandler = (error: ArchiverError) => reject(error);
			const successHandler = () => resolve(archive);

			archive.on('error', errorHandler);
			archive.on('close', successHandler);
			archive.on('end', successHandler);
			archive.on('finish', successHandler);

			for (const file of files) {
				const dirPath = PathUtils.join(configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));
				archive.append(createReadStream(dirPath), { name: file.path });
			}

			archive.finalize();
		});
	}
}
