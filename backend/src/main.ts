import { NestFactory } from '@nestjs/core';
import { configureApplication } from 'src/app.config';
import { Logger } from 'src/logging/InjectLogger';
import { AppModule } from './api/app.module';

async function bootstrap() {
	const application = await NestFactory.create(AppModule, {
		logger: Logger,
	});

	console.error(process.env)

	configureApplication(application);

	await application.listen(3000);
}

bootstrap();
