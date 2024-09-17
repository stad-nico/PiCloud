import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DirectoriesOnlyTree, ROOT_ID, TreeRoot } from 'src/app/core/components/explorer/state/explorer.state';
import { DirectoryTreeItemComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/components/directory-tree-item/directory-tree-item.component';
import { NameableDirectoryItemComponent } from 'src/app/shared/components/nameable-directory-item/nameable-directory-item.component';

@Component({
	standalone: true,
	selector: 'pure-directory-tree',
	templateUrl: './pure-directory-tree.component.html',
	styleUrl: './pure-directory-tree.component.css',
	imports: [DirectoryTreeItemComponent, NameableDirectoryItemComponent],
})
export class PureDirectoryTreeComponent {
	@Input()
	public root: TreeRoot = { name: 'root', id: ROOT_ID };

	@Input()
	public tree: DirectoriesOnlyTree = {};

	@Input()
	public expandedIds: Array<string> = [];

	@Input()
	public showCreateDirectoryComponent: boolean = false;

	@Input()
	public selectedId: string = ROOT_ID;

	@Output()
	public onLoadContent: EventEmitter<string> = new EventEmitter();

	@Output()
	public onCollapse: EventEmitter<string> = new EventEmitter();

	@Output()
	public onExpand: EventEmitter<string> = new EventEmitter();

	@Output()
	public onSelect: EventEmitter<string> = new EventEmitter();
}
