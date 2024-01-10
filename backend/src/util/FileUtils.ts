import { Archiver, ArchiverError, create as createArchiver } from 'archiver';
import { createReadStream } from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { ConfigService } from '@nestjs/config';
import { StoragePath } from 'src/disk/DiskService';
import { PathUtils } from 'src/util/PathUtils';

export class FileUtils {
	/**
	 * Normalizes a path for the current os by replacing / or \ with `path.sep`
	 *
	 * @param pathToNormalize the path to normalize
	 * @returns the normalized path
	 */
	public static normalizePathForOS(pathToNormalize: string): string {
		return pathToNormalize.replaceAll(/(\/|\\)/gi, path.sep);
	}

	/**
	 * Try to delete the directory recursively.
	 * Throws error if fails.
	 *
	 * @throw fs error
	 *
	 * @param path the absolute path
	 * @param recursive whether subfolders should get deleted
	 */
	public static async deleteDirectoryOrFail(path: string, recursive: boolean = true): Promise<void> {
		return await fsPromises.rm(path, { recursive: recursive });
	}

	/**
	 * Try to create the directory recursively if it does not already exists.
	 * Throws error if fails.
	 *
	 * @throws fs Error
	 *
	 * @param path the absolute path
	 * @param recursive whether subfolders should be created
	 * @returns void
	 */
	public static async createDirectoryIfNotPresent(path: string, recursive: boolean = true): Promise<void> {
		if (await PathUtils.pathExists(path)) {
			return;
		}

		await fsPromises.mkdir(path, { recursive: recursive });
	}

	/**
	 * Writes a buffer to the disk
	 *
	 * @param absolutePath the destination path
	 * @param buffer the content
	 * @param recursive
	 */
	public static async writeFile(absolutePath: string, buffer: Buffer, recursive: boolean = true): Promise<void> {
		const normalizedPath = this.normalizePathForOS(absolutePath);

		if (recursive) {
			if (!(await PathUtils.pathExists(path.dirname(normalizedPath)))) {
				await fsPromises.mkdir(path.dirname(normalizedPath), { recursive: true });
			}
		}

		await fsPromises.writeFile(normalizedPath, buffer);
	}

	/**
	 * Copies a file
	 *
	 * @param from the source path
	 * @param to the destination path
	 * @param recursive
	 */
	public static async copyFile(from: string, to: string, recursive: boolean = true): Promise<void> {
		const fromNormalized = this.normalizePathForOS(from);
		const toNormalized = this.normalizePathForOS(to);

		if (recursive) {
			if (!(await PathUtils.pathExists(path.dirname(toNormalized)))) {
				await fsPromises.mkdir(path.dirname(toNormalized), { recursive: true });
			}
		}

		await fsPromises.copyFile(fromNormalized, toNormalized);
	}

	/**
	 * Empties a directory by removing all files and subfolder from it
	 *
	 * @param absolutePath the directory path
	 */
	public static async emptyDirectory(absolutePath: string): Promise<void> {
		const files = await fsPromises.readdir(absolutePath);

		for (const file of files) {
			await fsPromises.rm(path.join(absolutePath, file), { recursive: true });
		}
	}

	public static async createZIPArchive(configService: ConfigService, files: { uuid: string; path: string }[]): Promise<Archiver> {
		return new Promise<Archiver>((resolve, reject) => {
			const archive = createArchiver('zip');

			const errorHandler = (error: ArchiverError) => reject(error);
			const successHandler = () => resolve(archive);

			archive.on('error', errorHandler);
			archive.on('close', successHandler);
			archive.on('end', successHandler);
			archive.on('finish', successHandler);

			for (const file of files) {
				const dirPath = PathUtils.join(configService, PathUtils.uuidToDirPath(file.uuid), StoragePath.Data);
				archive.append(createReadStream(dirPath), { name: file.path });
			}

			archive.finalize();
		});
	}
}
