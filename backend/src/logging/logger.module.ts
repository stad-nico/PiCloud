import { Module } from '@nestjs/common';
import { Logger } from 'src/logging/Logger';

@Module({
	providers: [Logger],
	exports: [Logger],
})
export class LoggerModule {}
