import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { ContentType, Type } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListActions } from 'src/app/features/content-list/state/content-list.actions';

export interface ContentListStateModel {
	items: ContentType[];
	lastInteractedId: number | undefined;
}

@State<ContentListStateModel>({
	name: 'content_list',
	defaults: {
		items: [
			{
				type: Type.Directory,
				name: 'element',
				size: 239,
				createdAt: new Date(Date.now()).toISOString(),
				updatedAt: new Date(Date.now()).toISOString(),
				id: 0,
				isSelected: false,
			},
			{
				type: Type.Directory,
				name: 'element',
				size: 239,
				createdAt: new Date(Date.now()).toISOString(),
				updatedAt: new Date(Date.now()).toISOString(),
				id: 1,
				isSelected: false,
			},
			{
				type: Type.File,
				name: 'element',
				mimeType: 'text/plain',
				size: 239,
				createdAt: new Date(Date.now()).toISOString(),
				updatedAt: new Date(Date.now()).toISOString(),
				id: 2,
				isSelected: false,
			},
			{
				type: Type.File,
				name: 'element',
				mimeType: 'text/plain',
				size: 239,
				createdAt: new Date(Date.now()).toISOString(),
				updatedAt: new Date(Date.now()).toISOString(),
				id: 3,
				isSelected: false,
			},
			{
				type: Type.Directory,
				name: 'element',
				size: 239,
				createdAt: new Date(Date.now()).toISOString(),
				updatedAt: new Date(Date.now()).toISOString(),
				id: 4,
				isSelected: false,
			},
			{
				type: Type.Directory,
				name: 'element',
				size: 239,
				createdAt: new Date(Date.now()).toISOString(),
				updatedAt: new Date(Date.now()).toISOString(),
				id: 5,
				isSelected: false,
			},
			{
				type: Type.File,
				name: 'element',
				mimeType: 'text/plain',
				size: 239,
				createdAt: new Date(Date.now()).toISOString(),
				updatedAt: new Date(Date.now()).toISOString(),
				id: 6,
				isSelected: false,
			},
			{
				type: Type.File,
				name: 'element',
				mimeType: 'text/plain',
				size: 239,
				createdAt: new Date(Date.now()).toISOString(),
				updatedAt: new Date(Date.now()).toISOString(),
				id: 7,
				isSelected: false,
			},
		],
		lastInteractedId: undefined,
	},
})
@Injectable()
export class ContentListState {
	@Selector()
	public static getContent(state: ContentListStateModel) {
		return state.items;
	}

	@Selector()
	public static isAtLeastOneSelected(state: ContentListStateModel) {
		return state.items.some((item) => item.isSelected);
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
