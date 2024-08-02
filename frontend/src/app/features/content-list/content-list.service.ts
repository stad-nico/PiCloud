import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
	ListItemSelectEvent,
	ListItemUnselectEvent,
} from 'src/app/features/content-list/components/pure-content-list/components/selectable-directory-list-item/selectable-directory-list-item.component';
import { ContentType } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListActions } from 'src/app/features/content-list/state/content-list.actions';
import { ContentListState } from 'src/app/features/content-list/state/content-list.state';

@Injectable({
	providedIn: 'root',
})
export class ContentListService {
	private readonly store: Store;

	constructor(store: Store) {
		this.store = store;
	}

	public getContent(): Observable<Array<ContentType>> {
		return this.store.select(ContentListState.getContent);
	}

	public isAtLeastOneSelected(): Observable<boolean> {
		return this.store.select(ContentListState.isAtLeastOneSelected);
	}

	public select(event: ListItemSelectEvent) {
		if (event.shift) {
			this.store.dispatch(new ContentListActions.ShiftSelect(event.id));
		} else if (event.ctrl) {
			this.store.dispatch(new ContentListActions.CtrlSelect(event.id));
		} else {
			this.store.dispatch(new ContentListActions.SelectSingle(event.id));
		}
	}

	public unselect(event: ListItemUnselectEvent) {
		if (event.shift) {
			this.store.dispatch(new ContentListActions.ShiftUnselect(event.id));
		} else if (event.ctrl) {
			this.store.dispatch(new ContentListActions.CtrlUnselect(event.id));
		} else {
			this.store.dispatch(new ContentListActions.UnselectSingle(event.id));
		}
	}

	public selectAll() {
		this.store.dispatch(new ContentListActions.SelectAll());
	}

	public unselectAll() {
		this.store.dispatch(new ContentListActions.UnselectAll());
	}
}
