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
	DB_NAME!: string;

	@IsString()
	DB_PASSWORD!: string;

	@IsString()
	DB_URL!: string;
}

export enum Environment {
	Port = 'PORT',
	StoragePath = 'STORAGE_PATH',
	NodeENV = 'NODE_ENV',
	DBName = 'DB_NAME',
	DBPassword = 'DB_PASSWORD',
	DBUrl = 'DB_URL',
}

export function validate(config: Record<string, unknown>) {
	config['NODE_ENV'] = config['NODE_ENV'] ?? process.env.NODE_ENV ?? NodeEnv.Develop;

	const validatedConfig = plainToInstance(EnvVariables, config, { enableImplicitConversion: true });
	const errors = validateSync(validatedConfig, { skipMissingProperties: false });

	if (errors.length > 0) {
		throw new Error(errors[0]?.toString());
	}

	return validatedConfig;
}
