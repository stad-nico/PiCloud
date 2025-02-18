import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from 'generated';

@Component({
	selector: 'signup',
	standalone: true,
	imports: [RouterModule, FormsModule, ReactiveFormsModule],
	templateUrl: './signup.component.html',
	styleUrl: './signup.component.scss',
})
export class SignupComponent {
	signupForm: FormGroup;

	constructor(
		private formBuilder: FormBuilder,
		private usersService: UsersService,
		private router: Router
	) {
		this.signupForm = this.formBuilder.group({
			username: ['', Validators.required],
			password: ['', [Validators.required, Validators.minLength(4)]],
			confirmPassword: ['', Validators.required],
		});
	}

	onSubmit() {
		if (this.signupForm.valid) {
			const { username, password, confirmPassword } = this.signupForm.value;

			if (password !== confirmPassword) {
				alert('Passwords do not match');
				return;
			}

			this.usersService.createUser({ username, password }).subscribe({
				next: (response) => {
					console.log('User created successfully:', response);
					this.router.navigate(['login']);
				},
				error: (error) => {
					console.error('Error:', error);
				},
			});
		}
	}
}
