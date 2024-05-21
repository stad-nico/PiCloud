import { Component, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetPath } from 'src/components/app/actions/path';
import { ContentListComponent } from 'src/components/app/explorer/content-list/ContentListComponent';
import { InteractivePathComponent } from 'src/components/app/explorer/interactive-path/InteractivePathComponent';
import { TreeViewComponent } from 'src/components/app/explorer/tree-view/TreeViewComponent';
import { LoadingSpinnerComponent } from 'src/components/app/loading-spinner/LoadingSpinnerComponent';

@Component({
	selector: 'explorer',
	standalone: true,
	templateUrl: './ExplorerComponent.html',
	imports: [ContentListComponent, InteractivePathComponent, TreeViewComponent, LoadingSpinnerComponent],
	styleUrl: './ExplorerComponent.css',
})
export class ExplorerComponent {
	private readonly route: ActivatedRoute;

	private readonly store: Store;

	@HostBinding('class.loaded')
	loaded: boolean = false;

	contentListLoaded: boolean = false;

	treeViewLoaded: boolean = false;

	public constructor(route: ActivatedRoute, store: Store) {
		this.route = route;
		this.store = store;
	}

	ngOnInit() {
		this.store.dispatch(new GetPath(this.route));
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
