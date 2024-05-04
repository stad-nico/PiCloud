import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { configureApplication } from 'src/config/AppConfig';
import { Environment } from 'src/config/EnvConfig';
import { AppModule } from './AppModule';

async function bootstrap() {
	const application = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	configureApplication(application);

	const configService = application.get(ConfigService)
	await application.listen(+configService.get(Environment.Port || 3000));
}

bootstrap();
