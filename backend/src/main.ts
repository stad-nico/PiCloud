import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'src/logging/InjectLogger';
import { AppModule } from './api/app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: Logger,
	});

	app.useGlobalPipes(new ValidationPipe());

	await app.listen(3000);
}
bootstrap();
