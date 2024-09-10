import { Observable } from 'rxjs';

import { Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { ExplorerActions } from 'src/app/core/components/explorer/state/explorer.actions';
import { ExplorerState } from 'src/app/core/components/explorer/state/explorer.state';

export type CreateDirectoryInfo = {
	showCreateDirectoryComponent: boolean;
	isRoot: boolean;
};

@Injectable({
	providedIn: 'root',
})
export class ExplorerService {
	private readonly store: Store;

	public constructor(store: Store) {
		this.store = store;
	}

	public getCreateDirectoryInfo(): Observable<CreateDirectoryInfo> {
		return this.store.select(ExplorerState.getCreateDirectoryInfo);
	}

	public getDirectory(): Observable<string> {
		return this.store.select(ExplorerState.getDirectory);
	}

	public open(directoryId: string) {
		this.store.dispatch(new ExplorerActions.Open(directoryId));
	}

	public showCreateDirectoryComponent() {
		this.store.dispatch(new ExplorerActions.ShowCreateDirectoryComponent());
	}

	public hideCreateDirectoryComponent() {
		this.store.dispatch(new ExplorerActions.HideCreateDirectoryComponent());
	}

	public createDirectory(name: string) {
		this.store.dispatch(new ExplorerActions.CreateDirectory(name));
	}
}
