import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContentListComponent } from './content-list/ContentListComponent';

@Component({
	selector: 'app',
	standalone: true,
	templateUrl: './AppComponent.html',
	imports: [ContentListComponent, RouterOutlet],
})
export class AppComponent {
	title = 'frontend';
}
