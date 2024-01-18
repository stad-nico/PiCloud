import { Archiver, ArchiverError, create as createArchiver } from 'archiver';
import { createReadStream } from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { ConfigService } from '@nestjs/config';
import { StoragePath } from 'src/disk/DiskService';
import { PathUtils } from 'src/util/PathUtils';
import { Readable } from 'stream';

/**
 * Utility class for manipulating the file system.
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
	 * Writes a buffer to the disk.
	 *
	 * @param {string}  absolutePath     the destination path
	 * @param {Buffer}  buffer           the content
	 * @param {boolean} [recursive=true] whether destination path should be created if it does not exist
	 */
	public static async writeFile(absolutePath: string, buffer: Buffer, recursive: boolean = true): Promise<void> {
		const normalizedPath = PathUtils.prepareForFS(absolutePath);

		if (recursive) {
			if (!(await PathUtils.pathExists(path.dirname(normalizedPath)))) {
				await fsPromises.mkdir(path.dirname(normalizedPath), { recursive: true });
			}
		}

		await fsPromises.writeFile(normalizedPath, buffer);
	}

	/**
	 * Copies a file.
	 *
	 * @param {string}  from             the source path
	 * @param {string}  to               the destination path
	 * @param {boolean} [recursive=true] whether destination path should be created if it does not exist
	 */
	public static async copyFile(from: string, to: string, recursive: boolean = true): Promise<void> {
		const fromNormalized = PathUtils.prepareForFS(from);
		const toNormalized = PathUtils.prepareForFS(to);

		if (recursive) {
			if (!(await PathUtils.pathExists(path.dirname(toNormalized)))) {
				await fsPromises.mkdir(path.dirname(toNormalized), { recursive: true });
			}
		}

		await fsPromises.copyFile(fromNormalized, toNormalized);
	}

	/**
	 * Empties a directory by removing all files and subfolder from it.
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
	 * Creates a stream of a ZIP-Archive.
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
				const dirPath = PathUtils.join(configService, PathUtils.uuidToDirPath(file.id), StoragePath.Data);
				archive.append(createReadStream(dirPath), { name: file.path });
			}

			archive.finalize();
		});
	}
}
