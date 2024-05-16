import { Routes } from '@angular/router';
import { ExplorerComponent } from 'src/components/app/explorer/ExplorerComponent';

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
