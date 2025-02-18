import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'generated';
import { Observable, catchError, switchMap, throwError, EMPTY } from 'rxjs';

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

							const clonedRequest = request.clone({
								setHeaders: { Authorization: `Bearer ${newAccessToken}` },
							});

							return next.handle(clonedRequest);
						}),
						catchError((refreshError) => {
							console.error('Fehler beim Refresh:', refreshError);
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
