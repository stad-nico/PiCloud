import { Routes } from '@angular/router';
import { ExplorerComponent } from 'src/app/core/components/explorer/explorer.component';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'explorer' },
	{
		path: 'explorer',
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'root' },
			{ path: ':directoryId', component: ExplorerComponent },
		],
	},

	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
];
