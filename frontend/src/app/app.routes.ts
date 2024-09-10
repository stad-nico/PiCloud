import { Routes } from '@angular/router';
import { ExplorerComponent } from 'src/app/core/components/explorer/explorer.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'explorer' },
	{
		path: 'explorer',
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'root' },
			{ path: ':directoryId', component: ExplorerComponent },
		],
	},
];
