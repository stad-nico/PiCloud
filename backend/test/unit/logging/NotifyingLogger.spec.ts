import { NotifyingLogger } from 'src/logging/NotifyingLogger';

describe('NotifyingLogger', () => {
	it('should notify all loggers when debug is executed', () => {
		const loggers = [{ debug: (message: string, context: string) => {} }];
		const notifyingLogger = new NotifyingLogger(loggers as any);
		const debugSpy = jest.spyOn(loggers[0], 'debug');

		notifyingLogger.debug('test', 'context');

		expect(debugSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should notify all loggers when log is executed', () => {
		const loggers = [{ log: (message: string, context: string) => {} }];
		const notifyingLogger = new NotifyingLogger(loggers as any);
		const logSpy = jest.spyOn(loggers[0], 'log');

		notifyingLogger.log('test', 'context');

		expect(logSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should notify all loggers when warn is executed', () => {
		const loggers = [{ warn: (message: string, context: string) => {} }];
		const notifyingLogger = new NotifyingLogger(loggers as any);
		const warnSpy = jest.spyOn(loggers[0], 'warn');

		notifyingLogger.warn('test', 'context');

		expect(warnSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should notify all loggers when error is executed', () => {
		const loggers = [{ error: (message: string, context: string) => {} }];
		const notifyingLogger = new NotifyingLogger(loggers as any);
		const errorSpy = jest.spyOn(loggers[0], 'error');

		notifyingLogger.error('test', 'context');

		expect(errorSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should notify all loggers when fatal is executed', () => {
		const loggers = [{ fatal: (message: string, context: string) => {} }];
		const notifyingLogger = new NotifyingLogger(loggers as any);
		const fatalSpy = jest.spyOn(loggers[0], 'fatal');

		notifyingLogger.fatal('test', 'context');

		expect(fatalSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should add logger', () => {
		const notifyingLogger = new NotifyingLogger([]);

		notifyingLogger.add('test' as any);

		expect(notifyingLogger['loggersToNotify']).toEqual(['test']);
	});
});
