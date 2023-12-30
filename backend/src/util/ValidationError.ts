import { HttpStatus } from '@nestjs/common';
import { ServerError } from 'src/util/ServerError';

export class ValidationError extends ServerError<HttpStatus.BAD_REQUEST> {
	public constructor(message: string) {
		super(message, HttpStatus.BAD_REQUEST);
	}
}
