import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'generated';
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	selector: 'login',
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
	imports: [ReactiveFormsModule, RouterModule, CommonModule],
})
export class LoginComponent {
	loginForm: FormGroup;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private router: Router
	) {
		this.loginForm = this.formBuilder.group({
			username: ['', Validators.required],
			password: ['', [Validators.required, Validators.minLength(4)]],
		});
	}

	onSubmit() {
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
