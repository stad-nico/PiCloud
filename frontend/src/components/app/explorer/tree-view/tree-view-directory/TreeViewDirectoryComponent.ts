import { Component, Input } from '@angular/core';

@Component({
	selector: 'tree-view-directory',
	standalone: true,
	templateUrl: './TreeViewDirectoryComponent.html',
	styleUrl: './TreeViewDirectoryComponent.css',
})
export class TreeViewDirectoryComponent {
	@Input({ required: true })
	name!: string;
}
