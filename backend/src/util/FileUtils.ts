import { ConfigService } from '@nestjs/config';

import { Environment } from 'src/env.config';

import * as fsPromises from 'fs/promises';
import * as path from 'path';

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
		if (await FileUtils.pathExists(path)) {
			return;
		}

		await fsPromises.mkdir(path, { recursive: recursive });
	}

	/**
	 * Checks if a path exists on the fs by normalizing the path first and then using `fs.access`
	 *
	 * @param path the absolute path to check
	 * @returns true if the path exists, otherwise false
	 */
	public static async pathExists(path: string): Promise<boolean> {
		return (await fsPromises.access(FileUtils.normalizePathForOS(path)).catch(() => false)) === undefined;
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
			if (!(await FileUtils.pathExists(path.dirname(normalizedPath)))) {
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
			if (!(await FileUtils.pathExists(path.dirname(toNormalized)))) {
				await fsPromises.mkdir(path.dirname(toNormalized), { recursive: true });
			}
		}

		await fsPromises.copyFile(fromNormalized, toNormalized);
	}
}
