import { Observable } from 'rxjs';

import { AsyncPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { GetTreeSubDirectories, TreeViewStateName, TreeViewStateType } from 'src/components/app/actions/tree.state';
import { LoadingSpinnerComponent } from 'src/components/app/loading-spinner/LoadingSpinnerComponent';

@Component({
	selector: 'tree-view-directory',
	standalone: true,
	templateUrl: './TreeViewDirectoryComponent.html',
	styleUrl: './TreeViewDirectoryComponent.css',
	imports: [AsyncPipe, LoadingSpinnerComponent],
})
export class TreeViewDirectoryComponent {
	private readonly store: Store;

	private readonly router: Router;

	@Input({ required: true })
	path!: string;

	@Input({ required: true })
	hasChildren!: boolean;

	name!: string;

	collapsed: boolean = true;

	loaded: boolean = false;

	selected: boolean = false;

	children$!: Observable<{ name: string; hasChildren: boolean }[]>;

	appPath$!: Observable<string>;

	public constructor(store: Store, router: Router) {
		this.store = store;
		this.router = router;
	}

	ngOnInit() {
		this.name = this.path.split('/').at(-1)!;

		this.store
			.select((state) => state.path)
			.subscribe((appPath: string) => {
				this.selected = appPath === this.path;
				this.collapsed = this.collapsed ? !new RegExp(`${this.path}(\/|$)`, 'im').test(appPath) : false;
			});

		this.children$ = this.store.select((state: TreeViewStateType) => {
			return state[TreeViewStateName][this.path]?.children;
		});

		this.children$.subscribe((content) => {
			if (content) {
				this.loaded = true;
			}
		});

		if (!this.hasChildren) {
			this.collapsed = true;
			this.loaded = true;
		}

		if (!this.collapsed) {
			this.store.dispatch(new GetTreeSubDirectories(this.path));
		}
	}

	onClick() {
		if (this.hasChildren && this.collapsed) {
			this.toggle();
		}

		this.router.navigate([this.path]);
	}

	toggle(e?: Event) {
		e?.stopPropagation();

		this.collapsed = !this.collapsed;

		if (!this.collapsed && !this.loaded) {
			this.store.dispatch(new GetTreeSubDirectories(this.path));
		}
	}
}
