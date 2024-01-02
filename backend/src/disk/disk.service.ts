import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { statfs } from 'fs/promises';
import * as path from 'path';

import { Environment, NodeEnv } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

export enum StoragePath {
	Data = 'data',
	Bin = 'bin',
	Temp = 'temp',
}

@Injectable()
export class DiskService {
	private readonly logger = new Logger(DiskService.name);

	private readonly configService: ConfigService;

	private readonly storageLocationPath: string;

	private shouldCleanupOnShutdown: boolean;

	public constructor(configService: ConfigService) {
		this.configService = configService;
		this.storageLocationPath = this.configService.getOrThrow(Environment.StoragePath);

		const nodeEnv: NodeEnv = configService.get(Environment.NodeENV, NodeEnv.Develop);
		this.shouldCleanupOnShutdown = nodeEnv !== NodeEnv.Production;
	}

	public async beforeApplicationShutdown(): Promise<void> {
		if (!this.shouldCleanupOnShutdown) {
			return;
		}

		this.logger.log('Cleaning up...');

		await FileUtils.deleteDirectoryOrFail(this.storageLocationPath);

		this.logger.log('Finished cleaning up');
	}

	public async init(): Promise<void> {
		await this.initStorageLocation();
	}

	private async initStorageLocation(): Promise<void> {
		if (!(await PathUtils.pathExists(this.storageLocationPath))) {
			try {
				this.logger.log(`Trying to initialize storage location '${this.storageLocationPath}' ...`);

				await FileUtils.createDirectoryIfNotPresent(this.storageLocationPath);
				await FileUtils.createDirectoryIfNotPresent(path.join(this.storageLocationPath, StoragePath.Bin));
				await FileUtils.createDirectoryIfNotPresent(path.join(this.storageLocationPath, StoragePath.Data));
				await FileUtils.createDirectoryIfNotPresent(path.join(this.storageLocationPath, StoragePath.Temp));

				this.logger.log('Successfully initialized storage location');
			} catch (e) {
				throw new Error(`Could not create storage location '${this.storageLocationPath}': ${e}`);
			}
		}

		const stats = await statfs(this.storageLocationPath);
		const freeSpace = stats.bsize * stats.bfree;

		this.logger.log(`Storage location ${this.storageLocationPath} has ${this.formatBytes(freeSpace)} of free space`);
	}

	// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
	private formatBytes(bytes: number, decimals: number = 2): string {
		if (!+bytes) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}
}
