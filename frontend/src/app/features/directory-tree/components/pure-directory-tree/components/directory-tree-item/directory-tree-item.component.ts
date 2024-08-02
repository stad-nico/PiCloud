import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Leaf, Node } from 'src/app/features/directory-tree/state/directory-tree.state';

@Component({
	selector: 'directory-tree-item',
	standalone: true,
	templateUrl: './directory-tree-item.component.html',
	styleUrl: './directory-tree-item.component.css',
})
export class DirectoryTreeItemComponent {
	@Input({ required: true })
	public id!: number;

	@Input({ required: true })
	public name!: string;

	@HostBinding('class.has-children')
	@Input()
	public hasChildren: boolean = false;

	@HostBinding('class.is-selected')
	@Input()
	public isSelected: boolean = false;

	@HostBinding('class.is-collapsed')
	@Input()
	public isCollapsed: boolean = true;

	@Input()
	public children: Array<Leaf | Node> = [];

	@Output()
	public onClick: EventEmitter<number> = new EventEmitter();

	@Output()
	public onCollapse: EventEmitter<number> = new EventEmitter();

	@Output()
	public onExpand: EventEmitter<number> = new EventEmitter();

	public isLeaf(metadata: Leaf | Node): metadata is Leaf {
		return !('children' in metadata);
	}

	public onArrowClick(event: MouseEvent | PointerEvent) {
		event.stopPropagation();

		if (this.isCollapsed) {
			this.onExpand.emit(this.id);
		} else {
			this.onCollapse.emit(this.id);
		}
	}
}
