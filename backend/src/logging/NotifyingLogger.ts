import { ILogger } from 'src/logging/ILogger';

export class NotifyingLogger implements ILogger {
	private readonly loggersToNotify: ILogger[];

	constructor(loggersToNotify: ILogger[]) {
		this.loggersToNotify = loggersToNotify;
	}

	debug(message: string): void;
	debug(message: string, context: string): void;
	debug(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.debug(message, context);
		}
	}

	log(message: string): void;
	log(message: string, context: string): void;
	log(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.log(message, context);
		}
	}

	warn(message: string): void;
	warn(message: string, context: string): void;
	warn(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.warn(message, context);
		}
	}

	error(message: string): void;
	error(message: string, context: string): void;
	error(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.error(message, context);
		}
	}

	fatal(message: string): void;
	fatal(message: string, context: string): void;
	fatal(message: string, context?: string): void {
		for (const logger of this.loggersToNotify) {
			logger.fatal(message, context);
		}
	}

	add(logger: ILogger) {
		this.loggersToNotify.push(logger);
	}
}
