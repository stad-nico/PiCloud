import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export class AccessTokenInterceptor implements HttpInterceptor {
	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
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
