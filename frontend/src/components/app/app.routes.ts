import { Routes } from '@angular/router';
import { ContentListComponent } from 'src/components/app/content-list/ContentListComponent';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'root' },
	{
		path: '',
		children: [
			{
				path: '**',
				component: ContentListComponent,
				pathMatch: 'full',
			},
		],
	},
];
