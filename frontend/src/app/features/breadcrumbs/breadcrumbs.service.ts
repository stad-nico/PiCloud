import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
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
}
