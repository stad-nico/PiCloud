import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetPath } from 'src/components/app/actions/path';
import { ContentListComponent } from 'src/components/app/explorer/content-list/ContentListComponent';
import { InteractivePathComponent } from 'src/components/app/explorer/interactive-path/InteractivePathComponent';
import { TreeViewComponent } from 'src/components/app/explorer/tree-view/TreeViewComponent';

@Component({
	selector: 'explorer',
	standalone: true,
	templateUrl: './ExplorerComponent.html',
	imports: [ContentListComponent, InteractivePathComponent, TreeViewComponent],
	styleUrl: './ExplorerComponent.css',
})
export class ExplorerComponent {
	private readonly route: ActivatedRoute;

	private readonly store: Store;

	public constructor(route: ActivatedRoute, store: Store) {
		this.route = route;
		this.store = store;
	}

	ngOnInit() {
		this.store.dispatch(new GetPath(this.route));
	}
}
