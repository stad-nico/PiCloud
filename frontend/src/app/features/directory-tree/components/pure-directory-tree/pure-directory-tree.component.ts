import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DirectoryTreeItemComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/components/directory-tree-item/directory-tree-item.component';
import { Leaf, Node } from 'src/app/features/directory-tree/state/directory-tree.state';

@Component({
	standalone: true,
	selector: 'pure-directory-tree',
	templateUrl: './pure-directory-tree.component.html',
	styleUrl: './pure-directory-tree.component.css',
	imports: [DirectoryTreeItemComponent],
})
export class PureDirectoryTreeComponent {
	@Input({ required: true })
	public metadata!: Node | Leaf;

	@Output()
	public onClick: EventEmitter<number> = new EventEmitter();

	@Output()
	public onExpand: EventEmitter<number> = new EventEmitter();

	@Output()
	public onCollapse: EventEmitter<number> = new EventEmitter();

	public isLeaf(metadata: Leaf | Node): metadata is Leaf {
		return !('children' in metadata);
	}

	ngOnChange() {
		console.log('CHANGFED HERE');
	}
}
