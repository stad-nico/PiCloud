import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DirectoryTreeItemComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/components/directory-tree-item/directory-tree-item.component';
import { Node } from 'src/app/features/directory-tree/state/directory-tree.state';

@Component({
	standalone: true,
	selector: 'pure-directory-tree',
	templateUrl: './pure-directory-tree.component.html',
	styleUrl: './pure-directory-tree.component.css',
	imports: [DirectoryTreeItemComponent],
})
export class PureDirectoryTreeComponent {
	@Input({ required: true })
	public root!: Node;

	@Input({ required: true })
	public tree!: {
		[path: string]: Array<Node>;
	};

	@Output()
	public onLoadContent: EventEmitter<string> = new EventEmitter();

	@Output()
	public onCollapse: EventEmitter<string> = new EventEmitter();

	@Output()
	public onExpand: EventEmitter<string> = new EventEmitter();

	@Output()
	public onSelect: EventEmitter<string> = new EventEmitter();
}
