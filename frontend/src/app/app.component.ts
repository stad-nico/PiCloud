import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
	standalone: true,
	selector: 'app',
	templateUrl: './app.component.html',
	styleUrl: './app.component.css',
	imports: [RouterOutlet],
})
export class AppComponent {
	@HostBinding('class.light-theme')
	private readonly lightTheme: boolean = true;
}
