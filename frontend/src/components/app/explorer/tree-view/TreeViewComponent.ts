import { AsyncPipe } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetTreeSubDirectories } from 'src/components/app/actions/directory';
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

	children$!: Observable<{ name: string; hasChildren: boolean }[]>;

	public constructor(store: Store) {
		this.store = store;
	}

	ngOnInit() {
		this.name = this.path.split('/').at(-1)!;

		this.children$ = this.store.select((state) => {
			return state.tree[this.path]?.children;
		});

		this.children$.subscribe((content) => {
			if (content) {
				this.loaded = true;
			}
		});

		this.store.dispatch(new GetTreeSubDirectories(this.path));
	}
}
