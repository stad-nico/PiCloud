import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'generated';
import { catchError, EMPTY, Observable, switchMap, throwError } from 'rxjs';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
	private readonly authService = inject(AuthService);

	private readonly router = inject(Router);

	public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
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
