import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetTreeSubDirectories, TreeViewStateName } from 'src/components/app/actions/tree.state';
import { TreeViewDirectoryComponent } from 'src/components/app/explorer/tree-view/tree-view-directory/TreeViewDirectoryComponent';
import { LoadingSpinnerComponent } from 'src/components/app/loading-spinner/LoadingSpinnerComponent';

@Component({
	selector: 'tree-view',
	standalone: true,
	templateUrl: './TreeViewComponent.html',
	styleUrl: './TreeViewComponent.css',
	imports: [AsyncPipe, TreeViewDirectoryComponent, LoadingSpinnerComponent],
})
export class TreeViewComponent {
	private readonly store: Store;

	path: string = 'root';

	name!: string;

	@HostBinding('class.loaded')
	loaded: boolean = false;

	@Output()
	loadedEvent = new EventEmitter<boolean>();

	children$!: Observable<{ name: string; hasChildren: boolean }[]>;

	public constructor(store: Store) {
		this.store = store;
	}

	ngOnInit() {
		this.name = this.path.split('/').at(-1)!;

		this.children$ = this.store.select((state) => state[TreeViewStateName][this.path]?.children);

		this.children$.subscribe((content) => {
			if (content) {
				this.loaded = true;
				this.loadedEvent.emit(true);
			}
		});

		this.store.dispatch(new GetTreeSubDirectories(this.path));
	}
}
