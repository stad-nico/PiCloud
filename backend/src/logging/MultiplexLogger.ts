import { ILogger } from 'src/logging/ILogger';

export class MultiplexLogger implements ILogger {
	private readonly loggers: ILogger[];

	constructor(loggers: ILogger[]) {
		this.loggers = loggers;
	}

	debug(message: string): void {
		for (const logger of this.loggers) {
			logger.debug(message);
		}
	}
	log(message: string): void {
		for (const logger of this.loggers) {
			logger.log(message);
		}
	}
	warn(message: string): void {
		for (const logger of this.loggers) {
			logger.warn(message);
		}
	}
	error(message: string): void {
		for (const logger of this.loggers) {
			logger.error(message);
		}
	}
	fatal(message: string): void {
		for (const logger of this.loggers) {
			logger.fatal(message);
		}
	}

	addLogger(logger: ILogger) {
		this.loggers.push(logger);
	}
}
