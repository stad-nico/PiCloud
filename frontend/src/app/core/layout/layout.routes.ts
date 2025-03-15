import { Routes } from '@angular/router';

export const routes: Routes = [{ path: 'explorer', loadChildren: () => import('../../features/explorer/explorer.routes') }];

export default routes;
