import { Component, Input } from '@angular/core';

@Component({
	selector: 'tree-view-directory',
	standalone: true,
	templateUrl: './TreeViewDirectoryComponent.html',
})
export class TreeViewDirectoryComponent {
	@Input({ required: true })
	name!: string;
}
