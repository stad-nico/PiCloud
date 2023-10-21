import { ConsoleLogger } from '@nestjs/common';
import { NotifyingLogger } from 'src/logging/NotifyingLogger';

export const GlobalLogger = new NotifyingLogger([new ConsoleLogger()]);
