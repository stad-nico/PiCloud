import { HttpException, HttpStatus } from '@nestjs/common';

export class Error {
	private message: string;

	private status: HttpStatus;

	constructor(message: string, status: HttpStatus) {
		this.message = message;
		this.status = status;
	}

	public toHttpException(): HttpException {
		return new HttpException(this.message, this.status);
	}

	public getMessage(): string {
		return this.message;
	}

	public getStatus(): HttpStatus {
		return this.status;
	}
}
