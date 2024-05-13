/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { LoggerService } from '@nestjs/common';

import { GlobalLogger } from 'src/logging/GlobalLogger';
import { NotifyingLoggerWithContext } from 'src/logging/NotifyingLoggerWithContext';

export class Logger extends NotifyingLoggerWithContext implements LoggerService {
	public constructor(context?: string | undefined) {
		super(context, [GlobalLogger]);
	}
}
