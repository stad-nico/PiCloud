import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Crumb } from 'src/app/features/breadcrumbs/components/pure-breadcrumbs/pure-breadcrumbs.component';
import { BreadcrumbsActions } from 'src/app/features/breadcrumbs/state/breadcrumbs.actions';
import { BreadcrumbsState } from 'src/app/features/breadcrumbs/state/breadcrumbs.state';

@Injectable({ providedIn: 'root' })
export class BreadcrumbsService {
	private readonly store: Store;

	public constructor(store: Store) {
		this.store = store;
	}

	public getCrumbs() {
		return this.store.select(BreadcrumbsState.getCrumbs);
	}

	public addCrumbs(crumbs: Array<Crumb>) {
		this.store.dispatch(new BreadcrumbsActions.Add(crumbs));
	}

	public buildCrumbs(directoryId: string) {
		this.store.dispatch(new BreadcrumbsActions.BuildCrumbs(directoryId));
	}
}
