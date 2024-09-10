import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { append, patch, updateItem } from '@ngxs/store/operators';
import { DirectoriesService, FilesService } from 'generated';
import { catchError, defaultIfEmpty, forkJoin, ignoreElements, map, merge, switchMap, take, tap, timer } from 'rxjs';
import { ROOT_ID } from 'src/app/core/components/explorer/state/explorer.state';
import { ContentType, Type } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListActions } from 'src/app/features/content-list/state/content-list.actions';

const AlphabeticallyDirectoriesFirstSort = (a: ContentType, b: ContentType) => {
	return a.type !== b.type ? a.type - b.type : a.name.localeCompare(b.name);
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

	private readonly store: Store;

	constructor(directoriesService: DirectoriesService, filesService: FilesService, store: Store) {
		this.directoriesService = directoriesService;
		this.filesService = filesService;
		this.store = store;
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

	@Action(ContentListActions.AddDirectory)
	public addDirectory(ctx: StateContext<ContentListStateModel>, action: ContentListActions.AddDirectory) {
		ctx.setState(
			patch({
				items: append([action.directory]),
			})
		);
	}

	@Action(ContentListActions.FetchContent)
	public fetchContent(ctx: StateContext<ContentListStateModel>, action: ContentListActions.FetchContent) {
		if (!action.id || action.id === ROOT_ID) {
			ctx.setState(patch({ isLoading: false }));
			return;
		}

		return merge(
			this.directoriesService.getContents(action.id).pipe(
				switchMap((response) => {
					const items = [
						...response.files.map((file) => ({ type: Type.File as Type.File, ...file })),
						...response.directories.map((directory) => ({ type: Type.Directory as Type.Directory, ...directory })),
					];

					return forkJoin(
						items.map((item) =>
							item.type === Type.File
								? this.filesService.getFileMetadata(action.id!, item.id).pipe(
										catchError((error) => {
											throw new Error(error);
										}),
										map((response) => ({ ...item, ...response, id: item.id }))
									)
								: this.directoriesService.getMetadata(item.id).pipe(
										catchError((error) => {
											throw new Error(error);
										}),
										map((response) => ({ ...item, ...response, id: item.id }))
									)
						)
					);
				}),
				defaultIfEmpty([]),
				tap((items) => {
					ctx.setState(
						patch({
							items: items.map((item) => ({ ...item, isSelected: false, isBeingProcessed: false })).sort(AlphabeticallyDirectoriesFirstSort),
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
}
