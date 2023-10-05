import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type DiskServiceOptions = {};

@Injectable()
export class DiskService {
	private readonly configService: ConfigService;

	private readonly options: DiskServiceOptions;

	constructor(configService: ConfigService, options: DiskServiceOptions) {
		this.configService = configService;
		this.options = options;
	}
}
