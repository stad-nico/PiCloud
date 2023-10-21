import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

export class EnvVariables {
	@IsNumber()
	PORT!: number;

	@IsString()
	DISK_FULL_PATH!: string;
}

export enum Environment {
	DISK_FULL_PATH = 'DISK_FULL_PATH',
}

export function validate(config: Record<string, unknown>) {
	const validatedConfig = plainToInstance(EnvVariables, config, { enableImplicitConversion: true });
	const errors = validateSync(validatedConfig, { skipMissingProperties: false });

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}

	return validatedConfig;
}
