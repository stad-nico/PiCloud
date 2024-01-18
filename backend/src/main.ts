import { NestFactory } from '@nestjs/core';

import { configureApplication } from 'src/config/AppConfig';
import { AppModule } from './AppModule';

async function bootstrap() {
	const application = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	configureApplication(application);

	await application.listen(3000);
}

bootstrap();
