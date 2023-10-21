import { NestFactory } from '@nestjs/core';
import { configureApplication } from 'src/app.config';
import { AppModule } from './api/app.module';

async function bootstrap() {
	const application = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	configureApplication(application);

	await application.listen(3000);
}

bootstrap();
