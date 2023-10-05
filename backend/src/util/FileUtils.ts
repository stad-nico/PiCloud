import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileUtils {
	@Inject(ConfigService)
	private static configService: ConfigService;

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
	 * Checks if a path exists on the fs by normalizing the path first and then using `fs.access`
	 *
	 * @param path the absolute path to check
	 * @returns true if the path exists, otherwise false
	 */
	public static async pathExists(path: string): Promise<boolean> {
		return (await fs.access(FileUtils.normalizePathForOS(path)).catch(() => false)) === undefined;
	}

	/**
	 * Checks if a path does not leave the directory specified in `env.DISK_PATH` by joining it with `DISK_PATH`
	 *
	 * @example
	 * process.env.DISK_PATH = "C:/test";
	 * isPathRelative("t.txt"); // returns true
	 * isPathRelative("../../f.txt"); // returns false
	 *
	 * @param relativePath the path relative to `DISK_PATH` to check
	 * @returns
	 */
	public static isPathRelative(relativePath: string): boolean {
		const diskPath: string = this.configService.getOrThrow('DISK_PATH');
		const relative = path.relative(diskPath, path.join(diskPath, relativePath));

		return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
	}

	/**
	 * Joins a path with the environment variable `DISK_PATH` and returns normalized path
	 *
	 * @param relativePath the path relative to `DISK_PATH` to join
	 * @returns the joined and normalized path
	 */
	public static join(relativePath: string): string {
		return path.join(this.configService.getOrThrow('DISK_PATH'), relativePath);
	}
}
