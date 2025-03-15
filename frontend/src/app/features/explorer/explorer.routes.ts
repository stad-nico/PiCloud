import { Routes } from '@angular/router';
import { RootRedirectGuard } from 'src/app/features/explorer/guards/root-redirect.guard';

const routes: Routes = [
	{ path: '', pathMatch: 'full', canActivate: [RootRedirectGuard], loadComponent: () => import('./explorer.component') },
	{ path: ':directoryId', loadComponent: () => import('./explorer.component') },
];

export default routes;
