/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ValidationError } from 'class-validator';

import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HttpExceptionFilter } from 'src/api/HttpExceptionFilter';
import { TestValidationPipe } from 'src/api/TestValidationPipe';
import { DirectoryContentParams } from 'src/api/directory/mapping/content';
import { DirectoryCreateParams } from 'src/api/directory/mapping/create';
import { DirectoryDeleteParams } from 'src/api/directory/mapping/delete';
import { DirectoryDownloadParams } from 'src/api/directory/mapping/download';
import { DirectoryMetadataParams } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameParams } from 'src/api/directory/mapping/rename';
import { Environment, NodeEnv } from 'src/config/EnvConfig';
import { InvalidDirectoryPathException } from 'src/exceptions/InvalidDirectoryPathException';
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
					return new BadRequestException(Object.values(errors[0]?.constraints!)[0]);
				},
				transform: true,
			})
		);
	} else {
		application.useLogger(new Logger());
		application.useGlobalPipes(
			new ValidationPipe({
				exceptionFactory: (errors: ValidationError[]) => {
					const error = errors[0]!;

					if (
						error.property === 'path' &&
						(error.target instanceof DirectoryCreateParams ||
							error.target instanceof DirectoryContentParams ||
							error.target instanceof DirectoryDeleteParams ||
							error.target instanceof DirectoryDownloadParams ||
							error.target instanceof DirectoryMetadataParams ||
							error.target instanceof DirectoryRenameParams)
					) {
						return new InvalidDirectoryPathException(error.value);
					}

					return new BadRequestException(Object.values(errors[0]?.constraints!)[0]);
				},
				transform: true,
			})
		);
	}
}
