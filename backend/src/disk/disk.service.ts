import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment, NodeEnv } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';

import { statfs } from 'fs/promises';

@Injectable()
export class DiskService {
	private readonly logger = new Logger(DiskService.name);

	private readonly configService: ConfigService;

	private readonly storageLocation: string;

	private readonly recycleLocation: string;

	private shouldCleanupOnShutdown: boolean;

	constructor(configService: ConfigService) {
		this.configService = configService;
		this.storageLocation = configService.getOrThrow(Environment.DiskStoragePath);
		this.recycleLocation = configService.getOrThrow(Environment.DiskRecyclePath);

		const nodeEnv: NodeEnv = configService.get(Environment.NodeENV, NodeEnv.Develop);
		this.shouldCleanupOnShutdown = nodeEnv !== NodeEnv.Production;
	}

	public async beforeApplicationShutdown(): Promise<void> {
		if (!this.shouldCleanupOnShutdown) {
			return;
		}

		this.logger.log('Cleaning up...');

		await FileUtils.deleteDirectoryOrFail(this.configService.getOrThrow(Environment.DiskStoragePath));
		await FileUtils.deleteDirectoryOrFail(this.configService.getOrThrow(Environment.DiskRecyclePath));

		this.logger.log('Finished cleaning up');
	}

	public async init() {
		await this.initStorageLocation();
		await this.initRecycleLocation();
	}

	private async initRecycleLocation() {
		if (!(await FileUtils.pathExists(this.recycleLocation))) {
			try {
				this.logger.log('Trying to initialize recycle location...');

				await FileUtils.createDirectoryIfNotPresent(this.recycleLocation);

				this.logger.log('Successfully initialized recycle location');
			} catch (e) {
				throw new Error(`Could not create the recycle location ${this.recycleLocation}: ${e}`);
			}
		}

		const stats = await statfs(this.storageLocation);
		const freeSpace = stats.bsize * stats.bfree;

		this.logger.log(`Recycle location ${this.storageLocation} has ${this.formatBytes(freeSpace)} of free space`);
	}

	private async initStorageLocation() {
		if (!(await FileUtils.pathExists(this.storageLocation))) {
			try {
				this.logger.log('Trying to initialize storage location...');

				await FileUtils.createDirectoryIfNotPresent(this.storageLocation);

				this.logger.log('Successfully initialized storage location');
			} catch (e) {
				throw new Error(`Could not create the storage location ${this.storageLocation}: ${e}`);
			}
		}

		const stats = await statfs(this.storageLocation);
		const freeSpace = stats.bsize * stats.bfree;

		this.logger.log(`Storage location ${this.storageLocation} has ${this.formatBytes(freeSpace)} of free space`);
	}

	// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
	private formatBytes(bytes: number, decimals: number = 2) {
		if (!+bytes) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}
}
