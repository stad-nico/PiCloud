import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'class-validator';

import { HttpExceptionFilter } from 'src/api/HttpExceptionFilter';
import { TestValidationPipe } from 'src/api/TestValidationPipe';
import { Environment, NodeEnv } from 'src/env.config';
import { Logger } from 'src/logging/Logger';

export function configureApplication(application: INestApplication) {
	application.useGlobalFilters(new HttpExceptionFilter());

	application.enableShutdownHooks();

	const configService = application.get<ConfigService>(ConfigService);
	const applicationIsInTestMode = configService.get(Environment.NodeENV) === NodeEnv.Testing;

	if (applicationIsInTestMode) {
		application.useLogger(false);
		application.useGlobalPipes(
			new TestValidationPipe({
				exceptionFactory: (errors: ValidationError[]) => {
					return new BadRequestException(Object.values(errors[0].constraints!)[0]);
				},
				transform: true,
			})
		);
	} else {
		application.useLogger(new Logger());
		application.useGlobalPipes(
			new ValidationPipe({
				exceptionFactory: (errors: ValidationError[]) => {
					return new BadRequestException(Object.values(errors[0].constraints!)[0]);
				},
				transform: true,
			})
		);
	}
}
