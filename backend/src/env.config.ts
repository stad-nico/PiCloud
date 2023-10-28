import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

export enum NodeEnv {
	Develop = 'dev',
	Production = 'prod',
	Testing = 'test',
}

export class EnvVariables {
	@IsNumber()
	PORT!: number;

	@IsString()
	DISK_FULL_PATH!: string;

	@IsEnum(NodeEnv)
	NODE_ENV!: NodeEnv;
}

export enum Environment {
	Port = 'PORT',
	DiskFullPath = 'DISK_FULL_PATH',
	NodeENV = 'NODE_ENV',
}

export function validate(config: Record<string, unknown>) {
	config['NODE_ENV'] = (process.env.NODE_ENV ?? NodeEnv.Develop).trim();

	const validatedConfig = plainToInstance(EnvVariables, config, { enableImplicitConversion: true });
	const errors = validateSync(validatedConfig, { skipMissingProperties: false });

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}

	return validatedConfig;
}
