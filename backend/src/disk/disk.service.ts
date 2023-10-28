import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment, NodeEnv } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';

import { statfs } from 'fs/promises';

@Injectable()
export class DiskService {
	private readonly logger = new Logger(DiskService.name);

	private readonly configService: ConfigService;

	private readonly fullPath: string;

	private shouldCleanupOnShutdown: boolean;

	constructor(configService: ConfigService) {
		this.configService = configService;
		this.fullPath = configService.getOrThrow(Environment.DiskFullPath);

		const nodeEnv: NodeEnv = configService.get(Environment.NodeENV, NodeEnv.Develop);
		this.shouldCleanupOnShutdown = nodeEnv !== NodeEnv.Production;
	}

	public async beforeApplicationShutdown(): Promise<void> {
		if (!this.shouldCleanupOnShutdown) {
			return;
		}

		return FileUtils.deleteDirectoryOrFail(this.configService.getOrThrow(Environment.DiskFullPath));
	}

	public async init() {
		if (!(await FileUtils.pathExists(this.fullPath))) {
			try {
				await FileUtils.createDirectoryIfNotPresent(this.fullPath);
			} catch (e) {
				throw new Error(`Could not create the storage location ${this.fullPath}: ${e}`);
			}
		}

		const stats = await statfs(this.fullPath);
		const freeSpace = stats.bsize * stats.bfree;

		this.logger.log(`Storage location ${this.fullPath} has ${this.formatBytes(freeSpace)} of free space`);
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
