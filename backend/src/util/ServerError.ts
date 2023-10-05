import { BadRequestException, ConflictException, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';

export class ServerError<T extends keyof ExceptionTypeMap> extends Error {
	private status: T;

	constructor(message: string, status: T) {
		super(message);

		this.status = status;
	}

	public toHttpException(): ExceptionTypeMap[T] {
		return new ExceptionClassMap[this.status](this.message);
	}
}

type ExceptionTypeMap = {
	[HttpStatus.BAD_REQUEST]: BadRequestException;
	[HttpStatus.CONFLICT]: ConflictException;
	[HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorException;
};

const ExceptionClassMap: Record<keyof ExceptionTypeMap, { new (...args: any[]): HttpException }> = {
	[HttpStatus.BAD_REQUEST]: BadRequestException,
	[HttpStatus.CONFLICT]: ConflictException,
	[HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorException,
};
