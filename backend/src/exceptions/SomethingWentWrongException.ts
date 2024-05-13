import { InternalServerErrorException } from '@nestjs/common';

export class SomethingWentWrongException extends InternalServerErrorException {
	public constructor() {
		super(`something went wrong`);
	}
}
