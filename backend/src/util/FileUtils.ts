/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import * as fsPromises from 'fs/promises';
import JSZip from 'jszip';
import * as path from 'path';
import { StoragePath } from 'src/modules/disk/DiskService';
import { PathUtils } from 'src/util/PathUtils';
import { Readable } from 'stream';

/**
 * Utility class for operations on the file system.
 * @class
 */
export class FileUtils {
	/**
	 * Tries to delete the directory recursively.
	 * Throws an error if it fails.
	 *
	 * @param path the absolute path
	 * @param recursive whether subfolders should get deleted
	 */
	public static async deleteDirectoryOrFail(path: string, recursive = true): Promise<void> {
		await fsPromises.rm(path, { recursive: recursive });
	}

	/**
	 * Tries to create the directory recursively if it does not already exist.
	 * Throws an error if it fails.
	 *
	 * @param path the absolute path
	 * @param recursive whether subfolders should be created
	 */
	public static async createDirectoryIfNotPresent(path: string, recursive = true): Promise<void> {
		if (await PathUtils.pathExists(path)) {
			return;
		}

		await fsPromises.mkdir(path, { recursive: recursive });
	}

	/**
	 * Writes a file stream to the disk.
	 *
	 * @param absolutePath the destination path
	 * @param stream the file stream
	 * @param recursive whether destination path should be created if it does not exist
	 */
	public static async writeFile(absolutePath: string, buffer: Buffer, recursive = true): Promise<void> {
		const normalizedPath = PathUtils.prepareFilePathForFS(absolutePath);

		if (recursive) {
			const parentPath = PathUtils.prepareFilePathForFS(path.dirname(normalizedPath));

			if (!(await PathUtils.pathExists(parentPath))) {
				await fsPromises.mkdir(parentPath, { recursive: true });
			}
		}

		await fsPromises.writeFile(normalizedPath, buffer);
	}

	public static async deleteFile(absolutePath: string): Promise<void> {
		await fsPromises.rm(absolutePath);
	}

	/**
	 * Copies a file.
	 *
	 * @param from the source path
	 * @param to the destination path
	 * @param whether destination path should be created if it does not exist
	 */
	public static async copyFile(from: string, to: string, recursive = true): Promise<void> {
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
	 * @param absolutePath the directory path
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
	 * @param configService the config service
	 * @param files the files
	 * @returns readable stream
	 */
	public static async createZIPArchive(
		configService: ConfigService,
		files: Array<{ id: string; relativePath: string }>
	): Promise<Readable> {
		const zip = new JSZip();

		for (const file of files) {
			const filepath = PathUtils.join(configService, StoragePath.Data, PathUtils.uuidToDirPath(file.id));

			if (!(await PathUtils.pathExists(filepath))) {
				throw new Error('File exists in database but does not exist on disk');
			}

			zip.file(file.relativePath, createReadStream(filepath));
		}

		return new Readable().wrap(zip.generateNodeStream());
	}
}
