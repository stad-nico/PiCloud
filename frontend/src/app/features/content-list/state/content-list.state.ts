import { Injectable } from '@angular/core';
import { Navigate } from '@ngxs/router-plugin';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { DirectoryService } from 'generated';
import { tap } from 'rxjs';
import { ContentType, Directory, File, Type } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListActions } from 'src/app/features/content-list/state/content-list.actions';

export interface ContentListStateModel {
	items: ContentType[];
	lastInteractedId: number | undefined;
}

@State<ContentListStateModel>({
	name: 'content_list',
	defaults: {
		lastInteractedId: undefined,
		items: [],
	},
})
@Injectable()
export class ContentListState {
	private directoryService: DirectoryService;

	constructor(directoryService: DirectoryService) {
		this.directoryService = directoryService;
	}

	@Selector()
	public static selectContent(state: ContentListStateModel) {
		return state.items;
	}

	@Selector()
	public static isAtLeastOneSelected(state: ContentListStateModel) {
		return state.items.some((item) => item.isSelected);
	}

	@Action(ContentListActions.FetchContent)
	public fetchContent(ctx: StateContext<ContentListStateModel>, action: ContentListActions.FetchContent) {
		return this.directoryService.getDirectoryContent(action.path).pipe(
			tap((content) => {
				ctx.setState({
					items: [
						...(content.directories.map((directory) => ({ isSelected: false, type: Type.Directory, ...directory })) as Omit<Directory, 'id'>[]),
						...(content.files.map((file) => ({ isSelected: false, type: Type.File, ...file })) as Omit<File, 'id'>[]),
					].map((element, index) => ({ id: index, ...element })),
					lastInteractedId: undefined,
				});
			})
		);
	}

	@Action(ContentListActions.Open)
	public open(ctx: StateContext<ContentListStateModel>, action: ContentListActions.Open) {
		const name = ctx.getState().items.find((item) => item.id === action.id)?.name;

		if (!name) {
			return;
		}

		ctx.dispatch(new Navigate([name], {}, { relativeTo: action.route }));
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

		if (lastInteractedId === undefined) {
			ctx.dispatch(new ContentListActions.SelectSingle(action.id));
			return;
		}

		const start = Math.min(lastInteractedId, action.id);
		const end = Math.max(lastInteractedId, action.id);

		if (end - start <= 2 || this.isUnselectedInRange(ctx, start, end)) {
			this.selectRange(ctx, start, end);
		} else {
			this.unselectRange(ctx, start, end);
		}
	}

	@Action([ContentListActions.ShiftUnselect, ContentListActions.CtrlUnselect])
	public rangeUnselect(ctx: StateContext<ContentListStateModel>, action: ContentListActions.ShiftUnselect | ContentListActions.CtrlUnselect) {
		const lastInteractedId = ctx.getState().lastInteractedId;

		if (lastInteractedId === undefined) {
			ctx.dispatch(new ContentListActions.SelectSingle(action.id));
			return;
		}

		const start = Math.min(lastInteractedId, action.id);
		const end = Math.max(lastInteractedId, action.id);

		this.unselectRange(ctx, start === action.id ? start + 1 : start, end);

		ctx.dispatch(new ContentListActions.SelectSingle(action.id));
	}

	@Action(ContentListActions.SelectAll)
	public selectAll(ctx: StateContext<ContentListStateModel>) {
		const items = ctx.getState().items;

		ctx.setState({
			items: items.map((item) => ({ ...item, isSelected: true })),
			lastInteractedId: items.at(-1)?.id,
		});
	}

	@Action(ContentListActions.UnselectAll)
	public unselectAll(ctx: StateContext<ContentListStateModel>) {
		const items = ctx.getState().items;

		ctx.setState({
			items: items.map((item) => ({ ...item, isSelected: false })),
			lastInteractedId: items.at(0)?.id,
		});
	}

	private selectRange(ctx: StateContext<ContentListStateModel>, start: number, end: number) {
		for (let i = start; i <= end; i++) {
			ctx.dispatch(new ContentListActions.SelectSingle(i));
		}
	}

	private unselectRange(ctx: StateContext<ContentListStateModel>, start: number, end: number) {
		for (let i = start; i <= end; i++) {
			ctx.dispatch(new ContentListActions.UnselectSingle(i));
		}
	}

	private isUnselectedInRange(ctx: StateContext<ContentListStateModel>, from: number, to: number): boolean {
		if (from > to) {
			[from, to] = [to, from];
		}

		return ctx.getState().items.find((item) => item.id >= from && item.id <= to && !item.isSelected) !== undefined;
	}
}
