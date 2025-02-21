import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'generated';

@Component({
	standalone: true,
	selector: 'login',
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
	imports: [ReactiveFormsModule, RouterModule, CommonModule],
})
export class LoginComponent {
	protected readonly loginForm: FormGroup;

	private readonly formBuilder = inject(FormBuilder);

	private readonly authService = inject(AuthService);

	private readonly router = inject(Router);

	constructor() {
		this.loginForm = this.formBuilder.group({
			username: ['', Validators.required],
			password: ['', [Validators.required, Validators.minLength(4)]],
		});
	}

	protected onSubmit(): void {
		if (this.loginForm.valid) {
			const { username, password } = this.loginForm.value;

			this.authService.login({ username, password }).subscribe({
				next: (response) => {
					console.log('Login successfully:', response);
					this.router.navigate(['']);
				},
				error: (error) => {
					console.error('Error:', error);
				},
			});
		}
	}
}
