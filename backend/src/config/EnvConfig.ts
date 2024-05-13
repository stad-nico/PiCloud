/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Type, plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

export enum NodeEnv {
	Develop = 'dev',
	Production = 'prod',
	Testing = 'test',
}

export class EnvVariables {
	@Type(() => Number)
	@IsNumber()
	PORT!: number;

	@IsString()
	STORAGE_PATH!: string;

	@IsEnum(NodeEnv)
	NODE_ENV!: NodeEnv;

	@IsString()
	DB_HOST!: string;

	@Type(() => Number)
	@IsNumber()
	DB_PORT!: number;

	@IsString()
	DB_NAME!: string;

	@IsString()
	DB_USERNAME!: string;

	@IsString()
	DB_PASSWORD!: string;
}

export enum Environment {
	Port = 'PORT',
	StoragePath = 'STORAGE_PATH',
	NodeENV = 'NODE_ENV',
	DBHost = 'DB_HOST',
	DBPort = 'DB_PORT',
	DBName = 'DB_NAME',
	DBPassword = 'DB_PASSWORD',
	DBUsername = 'DB_USERNAME',
}

export function validate(config: Record<string, unknown>) {
	config['NODE_ENV'] = config['NODE_ENV'] ?? process.env.NODE_ENV ?? NodeEnv.Develop;

	const validatedConfig = plainToInstance(EnvVariables, config, { enableImplicitConversion: true });
	const errors = validateSync(validatedConfig, { skipMissingProperties: false });

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}

	return validatedConfig;
}
