import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: "**", pathMatch: "full", redirectTo: "login" },
];
