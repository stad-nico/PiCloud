import { Routes } from '@angular/router';
import { ExplorerComponent } from 'src/app/core/components/explorer/explorer.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'root' },
	{
		path: '',
		children: [
			{
				path: '**',
				component: ExplorerComponent,
				pathMatch: 'full',
			},
		],
	},
];
