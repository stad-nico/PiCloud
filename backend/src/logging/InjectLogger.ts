import { ConsoleLogger } from '@nestjs/common';
import { NotifyingLogger } from 'src/logging/NotifyingLogger';
import { NotifyingLoggerWithContext } from 'src/logging/NotifyingLoggerWithContext';

export const Logger = new NotifyingLogger([new ConsoleLogger()]);

export function InjectLogger() {
	return function (target: any, key: string) {
		Object.defineProperty(target, key, {
			get: () => new NotifyingLoggerWithContext(target.constructor.name, [Logger]),
		});
	};
}
