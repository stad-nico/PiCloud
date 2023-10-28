import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { HttpExceptionFilter } from 'src/api/HttpExceptionFilter';
import { Logger } from 'src/logging/Logger';

export function configureApplication(application: INestApplication) {
	application.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (errors: ValidationError[]) => {
				return new BadRequestException(Object.values(errors[0].constraints!)[0]);
			},
		})
	);

	application.useGlobalFilters(new HttpExceptionFilter());

	application.useLogger(new Logger());
}
