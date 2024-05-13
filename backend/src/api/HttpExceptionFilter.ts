import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();

		// if (status === HttpStatus.BAD_REQUEST) {
		return response.status(status).json({ message: (exception.getResponse() as any)['message']! });
		// }

		// return response.status(status).end();
	}
}
