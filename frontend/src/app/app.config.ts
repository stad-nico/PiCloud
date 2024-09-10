import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';

import { routes } from 'src/app/app.routes';
import { ExplorerState } from 'src/app/core/components/explorer/state/explorer.state';
import { BreadcrumbsState } from 'src/app/features/breadcrumbs/state/breadcrumbs.state';
import { ContentListState } from 'src/app/features/content-list/state/content-list.state';
import { DirectoryTreeState } from 'src/app/features/directory-tree/state/directory-tree.state';

export const appConfig: ApplicationConfig = {
	providers: [
		provideAnimationsAsync(),
		provideRouter(routes),
		provideHttpClient(),
		importProvidersFrom(
			NgxsModule.forRoot([ContentListState, DirectoryTreeState, ExplorerState, BreadcrumbsState]),
			NgxsLoggerPluginModule.forRoot(),
			NgxsRouterPluginModule.forRoot()
		),
	],
};
