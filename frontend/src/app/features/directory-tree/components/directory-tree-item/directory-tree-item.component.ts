import { Component, HostBinding, Input } from '@angular/core';

@Component({
	selector: 'directory-tree-item',
	standalone: true,
	templateUrl: './directory-tree-item.component.html',
	styleUrl: './directory-tree-item.component.css',
})
export class DirectoryTreeItemComponent {
	@Input({ required: true })
	public name!: string;

	@Input({ required: true, alias: 'has-children' })
	@HostBinding('class.has-children')
	public hasChildren!: boolean;

	@Input()
	public children: Array<any> = [];

	@HostBinding('class.selected')
	public selected: boolean = false;
}
