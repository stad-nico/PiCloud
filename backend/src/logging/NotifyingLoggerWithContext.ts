/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ILogger } from 'src/logging/ILogger';

export class NotifyingLoggerWithContext implements ILogger {
	private readonly loggersToNotify: ILogger[];

	private readonly context: string | undefined;

	public constructor(context: string | undefined, loggersToNotify: ILogger[]) {
		this.context = context;
		this.loggersToNotify = loggersToNotify;
	}

	debug(message: string): void;
	debug(message: string, context: string): void;
	debug(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.debug(message, context ?? this.context);
		}
	}

	log(message: string): void;
	log(message: string, context: string): void;
	log(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.log(message, context ?? this.context);
		}
	}

	warn(message: string): void;
	warn(message: string, context: string): void;
	warn(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.warn(message, context ?? this.context);
		}
	}

	error(message: string): void;
	error(message: string, context: string): void;
	error(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.error(message, context ?? this.context);
		}
	}

	fatal(message: string): void;
	fatal(message: string, context: string): void;
	fatal(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.fatal(message, context ?? this.context);
		}
	}

	add(logger: ILogger) {
		this.loggersToNotify.push(logger);
	}
}
