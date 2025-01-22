/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ValidationError } from 'class-validator';

import { BadRequestException, ConsoleLogger, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment, NodeEnv } from 'src/config/env.config';
import { HttpExceptionFilter } from 'src/shared/HttpExceptionFilter';
import { TestValidationPipe } from 'src/shared/TestValidationPipe';

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
					return new BadRequestException(Object.values(errors[0]?.constraints!)[0]);
				},
				transform: true,
			})
		);
	} else {
		application.useLogger(new ConsoleLogger());
		application.useGlobalPipes(
			new ValidationPipe({
				exceptionFactory: (errors: ValidationError[]) => {
					return new BadRequestException(Object.values(errors[0]?.constraints!)[0]);
				},
				transform: true,
			})
		);
	}
}
