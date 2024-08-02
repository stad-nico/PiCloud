import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { PureDirectoryTreeComponent } from 'src/app/features/directory-tree/components/pure-directory-tree/pure-directory-tree.component';
import { DirectoryTreeActions } from 'src/app/features/directory-tree/state/directory-tree.actions';
import { Leaf, Node } from 'src/app/features/directory-tree/state/directory-tree.state';

@Component({
	standalone: true,
	selector: 'directory-tree',
	styleUrl: './directory-tree.component.css',
	templateUrl: './directory-tree.component.html',
	imports: [PureDirectoryTreeComponent],
})
export class DirectoryTreeComponent {
	private readonly store: Store;
	public readonly rootPath = '/root/';

	private readonly metadata$: Observable<Node | Leaf>;

	private readonly subscriptions: Subscription = new Subscription();

	public metadata!: Node | Leaf;

	constructor(store: Store) {
		this.metadata$ = store.select((state) => state['directory_tree']);
		this.store = store;
	}

	ngOnInit() {
		this.subscriptions.add(
			this.metadata$.subscribe((metadata) => {
				console.log('CHANGED');
				this.metadata = metadata;
			})
		);
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe();
	}

	public onClick(id: number) {
		this.store.dispatch(new DirectoryTreeActions.Select(id));
	}

	public onExpand(id: number) {
		this.store.dispatch(new DirectoryTreeActions.Expand(id));
	}

	public onCollapse(id: number) {
		this.store.dispatch(new DirectoryTreeActions.Collapse(id));
	}
}
