import { Component, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetPath, PathState } from 'src/components/app/actions/path';
import { ContentListComponent } from 'src/components/app/explorer/content-list/ContentListComponent';
import { InteractivePathComponent } from 'src/components/app/explorer/interactive-path/InteractivePathComponent';
import { MenuComponent } from 'src/components/app/explorer/menu/MenuComponent';
import { TreeViewComponent } from 'src/components/app/explorer/tree-view/TreeViewComponent';
import { LoadingSpinnerComponent } from 'src/components/app/loading-spinner/LoadingSpinnerComponent';

@Component({
	selector: 'explorer',
	standalone: true,
	templateUrl: './ExplorerComponent.html',
	imports: [ContentListComponent, InteractivePathComponent, TreeViewComponent, LoadingSpinnerComponent, MenuComponent],
	styleUrl: './ExplorerComponent.css',
})
export class ExplorerComponent {
	private readonly route: ActivatedRoute;

	private readonly store: Store;

	@HostBinding('class.loaded')
	loaded: boolean = false;

	@Select(PathState.path)
	path$!: Observable<string>;

	@ViewChild(TreeViewComponent)
	treeViewComponent!: TreeViewComponent;

	@ViewChild(ContentListComponent)
	contentListComponent!: ContentListComponent;

	contentListLoaded: boolean = false;

	treeViewLoaded: boolean = false;

	path!: string;

	public constructor(route: ActivatedRoute, store: Store) {
		this.route = route;
		this.store = store;
	}

	ngOnInit() {
		this.store.dispatch(new GetPath(this.route));

		this.path$.subscribe((path) => {
			this.path = path;
		});
	}

	createDirectory() {
		if (this.path === 'root') {
			this.treeViewComponent.displayDirectoryCreateComponent();
		} else {
			this.contentListComponent.displayDirectoryCreateComponent();
		}
	}

	contentListLoadedHandler() {
		this.contentListLoaded = true;

		if (this.treeViewLoaded) {
			this.loaded = true;
		}
	}

	treeViewLoadedHandler() {
		this.treeViewLoaded = true;

		if (this.contentListLoaded) {
			this.loaded = true;
		}
	}
}
