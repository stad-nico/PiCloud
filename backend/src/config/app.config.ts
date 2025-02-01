/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ValidationError } from 'class-validator';

import { BadRequestException, ConsoleLogger, INestApplication, ValidationPipe } from '@nestjs/common';

import { HttpExceptionFilter } from 'src/shared/HttpExceptionFilter';

export function configureApplication(application: INestApplication) {
	application.useGlobalFilters(new HttpExceptionFilter());

	application.enableShutdownHooks();

	application.useLogger(new ConsoleLogger());
	application.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (errors: Array<ValidationError>) => {
				const constraints = errors[0]?.constraints ?? {};
				return new BadRequestException(Object.values(constraints)[0]);
			},
			transform: true,
		})
	);
}
