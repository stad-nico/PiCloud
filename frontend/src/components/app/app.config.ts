import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { ContentListState } from 'src/components/app/actions/content.state';
import { PathState } from 'src/components/app/actions/path';
import { TreeViewState } from 'src/components/app/actions/tree.state';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		provideHttpClient(),
		importProvidersFrom(NgxsModule.forRoot([TreeViewState, PathState, ContentListState]), NgxsLoggerPluginModule.forRoot()),
	],
};
