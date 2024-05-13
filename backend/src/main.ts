import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configureApplication } from 'src/config/AppConfig';
import { Environment } from 'src/config/EnvConfig';
import { AppModule } from './AppModule';

async function bootstrap() {
	const application = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	configureApplication(application);

	const config = new DocumentBuilder().setTitle('Cloud API').setDescription('The cloud API description').setVersion('1.0').build();
	const document = SwaggerModule.createDocument(application, config);
	SwaggerModule.setup('api', application, document);

	const configService = application.get(ConfigService);
	await application.listen(+configService.get(Environment.Port || 3000));
}

bootstrap();
