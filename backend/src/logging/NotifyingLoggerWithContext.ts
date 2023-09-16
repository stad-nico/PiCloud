import { ILogger } from 'src/logging/ILogger';

export class NotifyingLoggerWithContext implements ILogger {
	private loggersToNotify: ILogger[];

	private context: string;

	constructor(context: string, loggersToNotify: ILogger[]) {
		this.context = context;
		this.loggersToNotify = loggersToNotify;
	}

	debug(message: string): void;
	debug(message: string, context?: string | undefined): void {
		for (let logger of this.loggersToNotify) {
			logger.debug(message, context ? context : this.context);
		}
	}

	log(message: string): void;
	log(message: string, context?: string | undefined): void {
		for (let logger of this.loggersToNotify) {
			logger.log(message, context ? context : this.context);
		}
	}

	warn(message: string): void;
	warn(message: string, context?: string | undefined): void {
		for (let logger of this.loggersToNotify) {
			logger.warn(message, context ? context : this.context);
		}
	}

	error(message: string): void;
	error(message: string, context?: string | undefined): void {
		for (let logger of this.loggersToNotify) {
			logger.error(message, context ? context : this.context);
		}
	}

	fatal(message: string): void;
	fatal(message: string, context?: string | undefined): void {
		for (let logger of this.loggersToNotify) {
			logger.fatal(message, context ? context : this.context);
		}
	}

	add(logger: ILogger) {
		this.loggersToNotify.push(logger);
	}
}
