import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import DE from '@angular/common/locales/de';
import DE_EXTRA from '@angular/common/locales/extra/de';
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { routes } from 'src/app/app.routes';
import { AccessTokenInterceptor } from 'src/app/shared/interceptors/access-token.interceptor';
import { UnauthorizedInterceptor } from 'src/app/shared/interceptors/unauthorized.interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideAnimationsAsync(),
		provideRouter(routes),
		provideHttpClient(withInterceptorsFromDi()),
		provideAppInitializer(() => registerLocaleData(DE, 'de-DE', DE_EXTRA)),
		{ provide: HTTP_INTERCEPTORS, useClass: UnauthorizedInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: AccessTokenInterceptor, multi: true },
	],
};
