import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExplorerComponent } from 'src/components/app/explorer/ExplorerComponent';

@Component({
	selector: 'app',
	standalone: true,
	templateUrl: './AppComponent.html',
	imports: [ExplorerComponent, RouterOutlet],
})
export class AppComponent {
	title = 'frontend';
}
