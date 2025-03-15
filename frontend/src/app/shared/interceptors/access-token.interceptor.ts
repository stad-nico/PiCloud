import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {
	public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const accessToken = localStorage.getItem('access_token');

		if (!accessToken) {
			return next.handle(request);
		}

		const authRequest = request.clone({
			setHeaders: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		return next.handle(authRequest);
	}
}
