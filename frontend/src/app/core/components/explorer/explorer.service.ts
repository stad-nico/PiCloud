import { map, Observable } from 'rxjs';

import { Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { ExplorerActions } from 'src/app/core/components/explorer/state/explorer.actions';
import { DirectoriesOnlyTree, Directory, ExplorerState, Tree, Type } from 'src/app/core/components/explorer/state/explorer.state';

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

	public getDirectoriesOnlyTree(): Observable<DirectoriesOnlyTree> {
		return this.store
			.select(ExplorerState.getTree)
			.pipe(
				map((tree) =>
					Object.fromEntries(
						Object.entries(tree).map(([key, value]) => [key, value.filter((item): item is Directory => item.type === Type.Directory)])
					)
				)
			);
	}

	public getTree(): Observable<Tree> {
		return this.store.select(ExplorerState.getTree);
	}

	public open(directoryId: string, itemType: Type, name?: string) {
		return this.store.dispatch(new ExplorerActions.Open(directoryId, itemType, name));
	}

	public loadInitialContent(directoryId: string) {
		return this.store.dispatch(new ExplorerActions.LoadInitialContent(directoryId));
	}

	public loadContent(directoryId: string) {
		return this.store.dispatch(new ExplorerActions.LoadContent(directoryId));
	}

	public createDirectory(name: string) {
		return this.store.dispatch(new ExplorerActions.CreateDirectory(name));
	}

	public deleteDirectory(id: string) {
		return this.store.dispatch(new ExplorerActions.DeleteDirectory(id));
	}

	public uploadFile(file: File) {
		return this.store.dispatch(new ExplorerActions.UploadFile(file));
	}

	public deleteFile(id: string) {
		return this.store.dispatch(new ExplorerActions.DeleteFile(id));
	}

	public showCreateDirectoryComponent() {
		return this.store.dispatch(new ExplorerActions.ShowCreateDirectoryComponent());
	}

	public hideCreateDirectoryComponent() {
		return this.store.dispatch(new ExplorerActions.HideCreateDirectoryComponent());
	}
}
