import { Component, HostBinding } from '@angular/core';
import { ContentListComponent } from 'src/app/features/content-list/content-list.component';
import { DirectoryTreeComponent } from 'src/app/features/directory-tree/directory-tree.component';

@Component({
	standalone: true,
	selector: 'app',
	templateUrl: './app.component.html',
	imports: [ContentListComponent, DirectoryTreeComponent],
})
export class AppComponent {
	@HostBinding('class.light-theme')
	private readonly lightTheme: boolean = true;
}
