import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '@pihub/components/button';
import { AuthService } from 'generated';

@Component({
	selector: 'login',
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
	imports: [ReactiveFormsModule, RouterModule, CommonModule, ButtonComponent],
})
export class LoginComponent {
	private readonly formBuilder = inject(FormBuilder);

	private readonly authService = inject(AuthService);

	private readonly router = inject(Router);

	protected readonly loginForm = this.formBuilder.nonNullable.group({
		username: this.formBuilder.nonNullable.control(''),
		password: this.formBuilder.nonNullable.control(''),
	});

	protected onSubmit(): void {
		if (this.loginForm.valid) {
			const { username, password } = this.loginForm.getRawValue();

			this.authService.login({ username, password }).subscribe((response) => {
				localStorage.setItem('access_token', response.accessToken);
				localStorage.setItem('refresh_token', response.refreshToken);

				this.router.navigate(['']);
			});
		}
	}
}
