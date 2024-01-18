import { NotifyingLoggerWithContext } from 'src/logging/NotifyingLoggerWithContext';

describe('NotifyingLoggerWithContext', () => {
	it('should notify all loggers when debug is executed', () => {
		const loggers = [{ debug: () => {} }];
		const notifyingLoggerWithContext = new NotifyingLoggerWithContext('abc', loggers as any);
		const debugSpy = jest.spyOn(loggers[0]!, 'debug');

		notifyingLoggerWithContext.debug('test');
		expect(debugSpy).toHaveBeenCalledWith('test', 'abc');

		notifyingLoggerWithContext.debug('test', 'context');
		expect(debugSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should notify all loggers when log is executed', () => {
		const loggers = [{ log: () => {} }];
		const notifyingLoggerWithContext = new NotifyingLoggerWithContext('abc', loggers as any);
		const logSpy = jest.spyOn(loggers[0]!, 'log');

		notifyingLoggerWithContext.log('test');
		expect(logSpy).toHaveBeenCalledWith('test', 'abc');

		notifyingLoggerWithContext.log('test', 'context');
		expect(logSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should notify all loggers when warn is executed', () => {
		const loggers = [{ warn: () => {} }];
		const notifyingLoggerWithContext = new NotifyingLoggerWithContext('abc', loggers as any);
		const warnSpy = jest.spyOn(loggers[0]!, 'warn');

		notifyingLoggerWithContext.warn('test');
		expect(warnSpy).toHaveBeenCalledWith('test', 'abc');

		notifyingLoggerWithContext.warn('test', 'context');
		expect(warnSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should notify all loggers when fatal is executed', () => {
		const loggers = [{ fatal: () => {} }];
		const notifyingLoggerWithContext = new NotifyingLoggerWithContext('abc', loggers as any);
		const fatalSpy = jest.spyOn(loggers[0]!, 'fatal');

		notifyingLoggerWithContext.fatal('test');
		expect(fatalSpy).toHaveBeenCalledWith('test', 'abc');

		notifyingLoggerWithContext.fatal('test', 'context');
		expect(fatalSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should notify all loggers when error is executed', () => {
		const loggers = [{ error: () => {} }];
		const notifyingLoggerWithContext = new NotifyingLoggerWithContext('abc', loggers as any);
		const errorSpy = jest.spyOn(loggers[0]!, 'error');

		notifyingLoggerWithContext.error('test');
		expect(errorSpy).toHaveBeenCalledWith('test', 'abc');

		notifyingLoggerWithContext.error('test', 'context');
		expect(errorSpy).toHaveBeenCalledWith('test', 'context');
	});

	it('should add logger', () => {
		const notifyingLoggerWithContext = new NotifyingLoggerWithContext(undefined, []);

		notifyingLoggerWithContext.add('test' as any);

		expect(notifyingLoggerWithContext['loggersToNotify']).toEqual(['test']);
	});
});
