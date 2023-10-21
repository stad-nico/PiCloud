import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Environment } from 'src/env.config';

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
	 * @param recursive
	 */
	public static async deleteDirectoryOrFail(path: string, recursive: boolean = true): Promise<void> {
		return await fs.rm(path, { recursive: recursive });
	}

	/**
	 * Try to create the directory recursively if it does not already exists.
	 * Throws error if fails.
	 *
	 * @throws fs Error
	 *
	 * @param path the absolute path
	 * @returns void
	 */
	public static async createDirectoryIfNotPresent(path: string, recursive: boolean = true): Promise<void> {
		if (await FileUtils.pathExists(path)) {
			return;
		}

		await fs.mkdir(path, { recursive: recursive });
	}

	/**
	 * Checks if a path exists on the fs by normalizing the path first and then using `fs.access`
	 *
	 * @param path the absolute path to check
	 * @returns true if the path exists, otherwise false
	 */
	public static async pathExists(path: string): Promise<boolean> {
		return (await fs.access(FileUtils.normalizePathForOS(path)).catch(() => false)) === undefined;
	}

	/**
	 * Checks if a path does not leave the directory specified in `env.DISK_FULL_PATH` by joining it with `DISK_FULL_PATH`
	 *
	 * @example
	 * process.env.DISK_FULL_PATH = "C:/test";
	 * isPathRelative("t.txt"); // returns true
	 * isPathRelative("../../f.txt"); // returns false
	 *
	 * @param relativePath the path relative to `DISK_FULL_PATH` to check
	 * @returns
	 */
	public static isPathRelative(configService: ConfigService, relativePath: string): boolean {
		const diskPath: string = configService.getOrThrow(Environment.DISK_FULL_PATH);
		const relative = path.relative(diskPath, path.join(diskPath, relativePath));

		return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
	}

	/**
	 * Joins a path with the environment variable `DISK_FULL_PATH` and returns normalized path
	 *
	 * @param relativePath the path relative to `DISK_FULL_PATH` to join
	 * @returns the joined and normalized path
	 */
	public static join(configService: ConfigService, relativePath: string): string {
		return path.join(configService.getOrThrow(Environment.DISK_FULL_PATH), relativePath);
	}
}
