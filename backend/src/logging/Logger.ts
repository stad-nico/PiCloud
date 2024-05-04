import { LoggerService } from '@nestjs/common';

import { GlobalLogger } from 'src/logging/GlobalLogger';
import { NotifyingLoggerWithContext } from 'src/logging/NotifyingLoggerWithContext';

export class Logger extends NotifyingLoggerWithContext implements LoggerService {
	public constructor(context?: string | undefined) {
		super(context, [GlobalLogger]);
	}
}
