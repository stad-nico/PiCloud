import { Component } from '@angular/core';
import { ContentListComponent } from './content-list/ContentListComponent';

@Component({
	selector: 'app',
	standalone: true,
	templateUrl: './AppComponent.html',
	styleUrl: './AppComponent.css',
	imports: [ContentListComponent],
})
export class AppComponent {
	title = 'frontend';
}
