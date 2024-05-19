import { AsyncPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetTreeSubDirectories } from 'src/components/app/actions/directory';
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

	name!: string;

	collapsed: boolean = true;

	loaded: boolean = false;

	children$!: Observable<string[]>;

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
				this.collapsed = this.collapsed ? !appPath.startsWith(this.path) : false;
			});

		this.children$ = this.store.select((state) => {
			return state.tree[this.path]?.children;
		});

		this.children$.subscribe((content) => {
			if (content) {
				this.loaded = true;
			}
		});

		if (!this.collapsed) {
			this.store.dispatch(new GetTreeSubDirectories(this.path));
		}
	}

	onClick() {
		if (this.collapsed) {
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
