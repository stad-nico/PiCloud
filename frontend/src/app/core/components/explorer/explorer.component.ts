import { Component } from '@angular/core';
import { ContentListComponent } from 'src/app/features/content-list/content-list.component';
import { DirectoryTreeComponent } from 'src/app/features/directory-tree/directory-tree.component';

@Component({
	standalone: true,
	selector: 'explorer',
	templateUrl: './explorer.component.html',
	styleUrl: './explorer.component.css',
	imports: [DirectoryTreeComponent, ContentListComponent],
})
export class ExplorerComponent {}
