import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { DirectoryTreeActions } from 'src/app/features/directory-tree/state/directory-tree.actions';
import { DirectoryTreeState } from 'src/app/features/directory-tree/state/directory-tree.state';

@Injectable({ providedIn: 'root' })
export class DirectoryTreeService {
	private readonly store: Store;

	public constructor(store: Store) {
		this.store = store;
	}

	public getRoot() {
		return this.store.select(DirectoryTreeState.getRoot);
	}

	public getTree() {
		return this.store.select(DirectoryTreeState.getTree);
	}

	public expand(id: string) {
		this.store.dispatch(new DirectoryTreeActions.Expand(id));
	}

	public collapse(id: string) {
		this.store.dispatch(new DirectoryTreeActions.Collapse(id));
	}

	public fetchInitialContent(id: string) {
		this.store.dispatch(new DirectoryTreeActions.FetchInitialContent(id));
	}

	public fetchContent(id: string) {
		this.store.dispatch(new DirectoryTreeActions.FetchContent(id));
	}

	public open(id: string) {
		this.store.dispatch(new DirectoryTreeActions.Open(id));
	}
}
