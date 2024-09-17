import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { ExplorerActions } from 'src/app/core/components/explorer/state/explorer.actions';
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

	public getExpandedIds() {
		return this.store.select(DirectoryTreeState.getExpandedIds);
	}

	public getSelectedId() {
		return this.store.select(DirectoryTreeState.getSelectedId);
	}

	// public getTree() {
	// 	return this.store.select(DirectoryTreeState.getTree);
	// }

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
		this.store.dispatch(new ExplorerActions.LoadContent(id));
	}

	public select(id: string) {
		this.store.dispatch(new DirectoryTreeActions.Select(id));
	}
}
