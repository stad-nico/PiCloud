import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'generated';
import { catchError, EMPTY, Observable, switchMap, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(
			catchError((error: unknown) => {
				if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
					const refreshToken = localStorage.getItem('refresh_token');

					if (request.url.includes('/auth/refresh') || !refreshToken) {
						this.router.navigate(['login']);
						return EMPTY;
					}

					return this.authService.refresh({ refreshToken }).pipe(
						switchMap((response) => {
							const newAccessToken = response.accessToken;
							const newRefreshToken = response.refreshToken;

							localStorage.setItem('access_token', newAccessToken);
							localStorage.setItem('refresh_token', newRefreshToken);

							return next.handle(request.clone());
						}),
						catchError(() => {
							this.router.navigate(['login']);
							return EMPTY;
						})
					);
				}

				return throwError(() => error);
			})
		);
	}
}
