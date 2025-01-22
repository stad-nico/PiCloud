/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ArgumentMetadata, PipeTransform, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export class TestValidationPipe extends ValidationPipe implements PipeTransform {
	private static disabled: boolean = false;

	public constructor(options?: ValidationPipeOptions | undefined) {
		super(options);
	}

	async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
		if (TestValidationPipe.disabled) {
			return value;
		}

		return super.transform(value, metadata);
	}

	public static disable() {
		TestValidationPipe.disabled = true;
	}

	public static enable() {
		TestValidationPipe.disabled = false;
	}
}
