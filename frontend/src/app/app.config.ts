import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';

import { routes } from 'src/app/app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideAnimationsAsync(),
		provideRouter(routes),
		provideHttpClient(),
		importProvidersFrom(
			NgxsModule.forRoot([]),
			NgxsLoggerPluginModule.forRoot(),
			NgxsRouterPluginModule.forRoot()
		),
	],
};
