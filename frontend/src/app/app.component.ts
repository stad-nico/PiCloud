import { Component, HostBinding } from '@angular/core';
import { ExplorerComponent } from 'src/app/core/components/explorer/explorer.component';

@Component({
	standalone: true,
	selector: 'app',
	templateUrl: './app.component.html',
	styleUrl: './app.component.css',
	imports: [ExplorerComponent],
})
export class AppComponent {
	@HostBinding('class.light-theme')
	private readonly lightTheme: boolean = true;
}
