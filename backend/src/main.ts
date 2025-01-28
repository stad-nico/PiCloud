/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { configureApplication } from 'src/config/app.config';
import { Environment } from 'src/config/env.config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const application = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	application.useGlobalPipes(new ValidationPipe());

	configureApplication(application);

	const configService = application.get(ConfigService);
	await application.listen(+configService.get(Environment.Port || 3000));
}

bootstrap();
