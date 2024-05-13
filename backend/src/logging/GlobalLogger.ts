/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ConsoleLogger } from '@nestjs/common';

import { NotifyingLogger } from 'src/logging/NotifyingLogger';

export const GlobalLogger = new NotifyingLogger([new ConsoleLogger()]);
