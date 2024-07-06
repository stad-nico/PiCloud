import { Component, Input } from '@angular/core';

@Component({
	selector: 'directory-tree-item',
	standalone: true,
	templateUrl: './directory-tree-item.component.html',
	styleUrl: './directory-tree-item.component.css',
})
export class DirectoryTreeItemComponent {
	@Input({ required: true })
	public name!: string;
}
