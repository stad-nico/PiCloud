import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { append, patch, removeItem } from '@ngxs/store/operators';
import { DirectoriesService, FilesService } from 'generated';
import { tap } from 'rxjs';
import { ExplorerActions } from 'src/app/core/components/explorer/state/explorer.actions';
import { ExplorerState, Type } from 'src/app/core/components/explorer/state/explorer.state';
import { ContentListActions } from 'src/app/features/content-list/state/content-list.actions';

export interface ContentListStateModel {
	lastInteractedId: string | undefined;
	selectedIds: Array<string>;
}

@State<ContentListStateModel>({
	name: 'content_list',
	defaults: {
		lastInteractedId: undefined,
		selectedIds: [],
	},
})
@Injectable()
export class ContentListState {
	constructor(
		private readonly store: Store,
		private readonly filesService: FilesService,
		private readonly directoriesService: DirectoriesService
	) {}

	@Selector()
	public static getSelectedIds(state: ContentListStateModel) {
		return state.selectedIds;
	}

	@Action(ContentListActions.SelectSingle)
	public selectItem(ctx: StateContext<ContentListStateModel>, action: ContentListActions.SelectSingle) {
		ctx.setState(
			patch({
				selectedIds: append([action.id]),
				lastInteractedId: action.id,
			})
		);
	}

	@Action(ContentListActions.UnselectSingle)
	public unselectItem(ctx: StateContext<ContentListStateModel>, action: ContentListActions.UnselectSingle) {
		ctx.setState(
			patch({
				selectedIds: removeItem((id) => id === action.id),
				lastInteractedId: action.id,
			})
		);
	}

	@Action([ContentListActions.ShiftSelect, ContentListActions.CtrlSelect])
	public rangeSelect(ctx: StateContext<ContentListStateModel>, action: ContentListActions.ShiftSelect | ContentListActions.CtrlSelect) {
		const lastInteractedId = ctx.getState().lastInteractedId;
		const ids = this.store.selectSnapshot(ExplorerState.getTree)[this.store.selectSnapshot(ExplorerState.getDirectory)].map((item) => item.id);

		if (!lastInteractedId) {
			ctx.dispatch(new ContentListActions.SelectSingle(action.id));
			return;
		}

		const selectedIndex = ids.findIndex((id) => id === action.id);
		const lastInteractedIndex = ids.findIndex((id) => id === lastInteractedId);

		const rangeStart = Math.min(selectedIndex, lastInteractedIndex);
		const rangeEnd = Math.max(selectedIndex, lastInteractedIndex) + 1;

		const idsToUpdate = ids.slice(rangeStart, rangeEnd);

		if (idsToUpdate.length <= 2 || idsToUpdate.some((id) => !ctx.getState().selectedIds.includes(id))) {
			ctx.setState(
				patch({
					selectedIds: append(idsToUpdate),
					lastInteractedId: rangeStart === selectedIndex ? idsToUpdate.at(0) : idsToUpdate.at(-1),
				})
			);
		} else {
			ctx.setState(
				patch({
					selectedIds: ctx.getState().selectedIds.filter((id) => !idsToUpdate.includes(id)),
					lastInteractedId: rangeStart === selectedIndex ? idsToUpdate.at(0) : idsToUpdate.at(-1),
				})
			);
		}
	}

	@Action([ContentListActions.ShiftUnselect, ContentListActions.CtrlUnselect])
	public rangeUnselect(ctx: StateContext<ContentListStateModel>, action: ContentListActions.ShiftUnselect | ContentListActions.CtrlUnselect) {
		const lastInteractedId = ctx.getState().lastInteractedId;
		const ids = this.store.selectSnapshot(ExplorerState.getTree)[this.store.selectSnapshot(ExplorerState.getDirectory)].map((item) => item.id);

		if (!lastInteractedId) {
			ctx.dispatch(new ContentListActions.SelectSingle(action.id));
			return;
		}

		const selectedIndex = ids.findIndex((id) => id === action.id);
		const lastInteractedIndex = ids.findIndex((id) => id === lastInteractedId);

		const rangeStart = Math.min(selectedIndex, lastInteractedIndex);
		const rangeEnd = Math.max(selectedIndex, lastInteractedIndex) + 1;

		const idsToUpdate = ids.slice(rangeStart, rangeEnd);

		if (idsToUpdate.some((id) => !ctx.getState().selectedIds.includes(id))) {
			ctx.setState(
				patch({
					selectedIds: append(idsToUpdate),
					lastInteractedId: action.id,
				})
			);
		} else {
			const slice = rangeStart === selectedIndex ? idsToUpdate.slice(1) : idsToUpdate.slice(0, -1);

			ctx.setState(
				patch({
					selectedIds: ctx.getState().selectedIds.filter((id) => !idsToUpdate.includes(id)),
					lastInteractedId: action.id,
				})
			);
		}
	}

	@Action(ContentListActions.SelectAll)
	public selectAll(ctx: StateContext<ContentListStateModel>) {
		ctx.setState(
			patch({
				selectedIds: this.store.selectSnapshot(ExplorerState.getTree)[this.store.selectSnapshot(ExplorerState.getDirectory)].map((item) => item.id),
				lastInteractedId: undefined,
			})
		);
	}

	@Action(ContentListActions.UnselectAll)
	public unselectAll(ctx: StateContext<ContentListStateModel>) {
		ctx.setState(
			patch({
				selectedIds: [],
				lastInteractedId: undefined,
			})
		);
	}

	@Action(ContentListActions.DeleteSelected)
	public deleteSelected(ctx: StateContext<ContentListStateModel>) {
		const items = this.store.selectSnapshot(ExplorerState.getTree)[this.store.selectSnapshot(ExplorerState.getDirectory)];
		const idsToDelete = ctx.getState().selectedIds;

		ctx.setState(patch({ selectedIds: [] }));

		return ctx.dispatch(
			idsToDelete.map((id) =>
				items.find((item) => item.id === id)?.type === Type.Directory ? new ExplorerActions.DeleteDirectory(id) : new ExplorerActions.DeleteFile(id)
			)
		);
	}

	@Action(ContentListActions.DownloadFile)
	public downloadFile(ctx: StateContext<ContentListStateModel>, action: ContentListActions.DownloadFile) {
		return this.filesService.downloadFile(this.store.selectSnapshot(ExplorerState.getDirectory), action.id).pipe(
			tap((body) => {
				const link = document.createElement('a');

				link.href = URL.createObjectURL(body);
				link.download = action.name;

				link.click();
			})
		);
	}

	@Action(ContentListActions.DownloadDirectory)
	public downloadDirectory(tx: StateContext<ContentListStateModel>, action: ContentListActions.DownloadDirectory) {
		return this.directoriesService.download(action.id).pipe(
			tap((body) => {
				const link = document.createElement('a');

				link.href = URL.createObjectURL(body);
				link.download = action.name;

				link.click();
			})
		);
	}
}
