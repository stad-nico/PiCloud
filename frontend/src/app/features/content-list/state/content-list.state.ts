import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { DirectoriesService, FilesService } from 'generated';
import { from, ignoreElements, merge, switchMap, take, tap, timer } from 'rxjs';
import { ExplorerActions } from 'src/app/core/components/explorer/state/explorer.actions';
import { ROOT_ID } from 'src/app/core/components/explorer/state/explorer.state';
import { ContentType, Type } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListActions } from 'src/app/features/content-list/state/content-list.actions';

const AlphabeticallyDirectoriesFirstSort = (a: ContentType, b: ContentType) => {
	return a.type !== b.type ? b.type - a.type : a.name.localeCompare(b.name);
};

export interface ContentListStateModel {
	isLoading: boolean;
	items: ContentType[];
	lastInteractedId: string | undefined;
}

@State<ContentListStateModel>({
	name: 'content_list',
	defaults: {
		isLoading: true,
		lastInteractedId: undefined,
		items: [],
	},
})
@Injectable()
export class ContentListState {
	private readonly directoriesService: DirectoriesService;

	private readonly filesService: FilesService;

	constructor(directoriesService: DirectoriesService, filesService: FilesService) {
		this.directoriesService = directoriesService;
		this.filesService = filesService;
	}

	@Selector()
	public static selectContent(state: ContentListStateModel) {
		return state.items;
	}

	@Selector()
	public static isAtLeastOneSelected(state: ContentListStateModel) {
		return state.items.some((item) => item.isSelected);
	}

	@Selector()
	public static selectIsLoading(state: ContentListStateModel) {
		return state.isLoading;
	}

	@Action(ContentListActions.AddItem)
	public addItem(ctx: StateContext<ContentListStateModel>, action: ContentListActions.AddItem) {
		ctx.setState(
			patch({
				items: append([action.item]),
			})
		);
	}

	@Action(ContentListActions.RemoveItem)
	public removeDirectory(ctx: StateContext<ContentListStateModel>, action: ContentListActions.RemoveItem) {
		ctx.setState(patch({ items: removeItem((item) => item.id === action.id) }));
	}

	@Action(ContentListActions.FetchContent)
	public fetchContent(ctx: StateContext<ContentListStateModel>, action: ContentListActions.FetchContent) {
		if (!action.id || action.id === ROOT_ID) {
			ctx.setState(patch({ isLoading: false }));
			return;
		}

		return merge(
			this.directoriesService.getContents(action.id).pipe(
				tap((contents) => {
					ctx.setState(
						patch({
							items: [
								...contents.directories.map((directory) => ({
									...directory,
									type: Type.Directory as Type.Directory,
									isSelected: false,
									isBeingProcessed: false,
								})),
								...contents.files.map((file) => ({ ...file, type: Type.File, isSelected: false, isBeingProcessed: false })),
							].sort(AlphabeticallyDirectoriesFirstSort),
							isLoading: false,
						})
					);
				})
			),
			timer(200).pipe(
				tap(() => ctx.setState(patch({ isLoading: true }))),
				ignoreElements()
			)
		).pipe(take(1));
	}

	@Action(ContentListActions.SelectSingle)
	public selectItem(ctx: StateContext<ContentListStateModel>, action: ContentListActions.SelectSingle) {
		ctx.setState(
			patch({
				items: updateItem((item) => item.id === action.id, patch({ isSelected: true })),
				lastInteractedId: action.id,
			})
		);
	}

	@Action(ContentListActions.UnselectSingle)
	public unselectItem(ctx: StateContext<ContentListStateModel>, action: ContentListActions.UnselectSingle) {
		ctx.setState(
			patch({
				items: updateItem((item) => item.id === action.id, patch({ isSelected: false })),
				lastInteractedId: action.id,
			})
		);
	}

	@Action([ContentListActions.ShiftSelect, ContentListActions.CtrlSelect])
	public rangeSelect(ctx: StateContext<ContentListStateModel>, action: ContentListActions.ShiftSelect | ContentListActions.CtrlSelect) {
		const lastInteractedId = ctx.getState().lastInteractedId;
		const items = ctx.getState().items;

		if (!lastInteractedId) {
			ctx.dispatch(new ContentListActions.SelectSingle(action.id));
			return;
		}

		const selectedIndex = items.findIndex((item) => item.id === action.id);
		const lastInteractedIndex = items.findIndex((item) => item.id === lastInteractedId);

		const rangeStart = Math.min(selectedIndex, lastInteractedIndex);
		const rangeEnd = Math.max(selectedIndex, lastInteractedIndex) + 1;

		const itemsToUpdate = items.slice(rangeStart, rangeEnd);

		if (itemsToUpdate.length <= 2 || itemsToUpdate.some((item) => !item.isSelected)) {
			ctx.setState(
				patch({
					items: items.map((item) => ({ ...item, isSelected: itemsToUpdate.includes(item) ? true : item.isSelected })),
					lastInteractedId: rangeStart === selectedIndex ? itemsToUpdate.at(0)?.id : itemsToUpdate.at(-1)?.id,
				})
			);
		} else {
			ctx.setState(
				patch({
					items: items.map((item) => ({ ...item, isSelected: itemsToUpdate.includes(item) ? false : item.isSelected })),
					lastInteractedId: rangeStart === selectedIndex ? itemsToUpdate.at(0)?.id : itemsToUpdate.at(-1)?.id,
				})
			);
		}
	}

	@Action([ContentListActions.ShiftUnselect, ContentListActions.CtrlUnselect])
	public rangeUnselect(ctx: StateContext<ContentListStateModel>, action: ContentListActions.ShiftUnselect | ContentListActions.CtrlUnselect) {
		const lastInteractedId = ctx.getState().lastInteractedId;
		const items = ctx.getState().items;

		if (!lastInteractedId) {
			ctx.dispatch(new ContentListActions.SelectSingle(action.id));
			return;
		}

		const selectedIndex = items.findIndex((item) => item.id === action.id);
		const lastInteractedIndex = items.findIndex((item) => item.id === lastInteractedId);

		const rangeStart = Math.min(selectedIndex, lastInteractedIndex);
		const rangeEnd = Math.max(selectedIndex, lastInteractedIndex) + 1;

		const itemsToUpdate = items.slice(rangeStart, rangeEnd);

		if (itemsToUpdate.some((item) => !item.isSelected)) {
			ctx.setState(
				patch({
					items: items.map((item) => ({ ...item, isSelected: itemsToUpdate.includes(item) ? true : item.isSelected })),
					lastInteractedId: action.id,
				})
			);
		} else {
			const slice = rangeStart === selectedIndex ? itemsToUpdate.slice(1) : itemsToUpdate.slice(0, -1);

			ctx.setState(
				patch({
					items: items.map((item) => ({ ...item, isSelected: slice.includes(item) ? false : item.isSelected })),
					lastInteractedId: action.id,
				})
			);
		}
	}

	@Action(ContentListActions.SelectAll)
	public selectAll(ctx: StateContext<ContentListStateModel>) {
		const items = ctx.getState().items;

		ctx.setState(
			patch({
				items: items.map((item) => ({ ...item, isSelected: true })),
				lastInteractedId: items.at(-1)?.id,
			})
		);
	}

	@Action(ContentListActions.UnselectAll)
	public unselectAll(ctx: StateContext<ContentListStateModel>) {
		const items = ctx.getState().items;

		ctx.setState(
			patch({
				items: items.map((item) => ({ ...item, isSelected: false })),
				lastInteractedId: items.at(0)?.id,
			})
		);
	}

	@Action(ContentListActions.DeleteSelected)
	public deleteSelected(ctx: StateContext<ContentListStateModel>) {
		const itemsToDelete = ctx.getState().items.filter((item) => item.isSelected);

		return from(itemsToDelete).pipe(
			switchMap((item) =>
				ctx.dispatch(item.type === Type.Directory ? new ExplorerActions.DeleteDirectory(item.id) : new ExplorerActions.DeleteFile(item.id))
			)
		);
	}
}
