import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem } from '@ngxs/store/operators';
import { ROOT_ID, TreeRoot } from 'src/app/core/components/explorer/state/explorer.state';
import { DirectoryTreeActions } from 'src/app/features/directory-tree/state/directory-tree.actions';

interface DirectoryTreeStateModel {
	isLoading: boolean;
	lastSelectedId: string | undefined;
	selectedId: string;
	expandedIds: Array<string>;
	root: TreeRoot;
}

@State<DirectoryTreeStateModel>({
	name: 'directory_tree',
	defaults: {
		isLoading: true,
		lastSelectedId: undefined,
		selectedId: 'root',
		expandedIds: [],
		root: {
			name: 'root',
			id: ROOT_ID,
		},
	},
})
@Injectable()
export class DirectoryTreeState {
	@Selector()
	public static getRoot(state: DirectoryTreeStateModel) {
		return state.root;
	}

	@Selector()
	public static getExpandedIds(state: DirectoryTreeStateModel) {
		return state.expandedIds;
	}

	@Selector()
	public static getSelectedId(state: DirectoryTreeStateModel) {
		return state.selectedId;
	}

	@Selector()
	public static getIsLoading(state: DirectoryTreeStateModel) {
		return state.isLoading;
	}

	@Action(DirectoryTreeActions.Collapse)
	public collapse(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Collapse) {
		ctx.setState(
			patch({
				expandedIds: removeItem((id) => id === action.id),
			})
		);
	}

	@Action(DirectoryTreeActions.Expand)
	public expand(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Expand) {
		if (ctx.getState().expandedIds.includes(action.id)) {
			return;
		}

		ctx.setState(
			patch({
				expandedIds: append([action.id]),
			})
		);
	}

	@Action(DirectoryTreeActions.Select)
	public select(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Select) {
		if (ctx.getState().expandedIds.includes(action.id)) {
			return ctx.setState(patch({ selectedId: action.id }));
		}

		ctx.setState(patch({ selectedId: action.id, expandedIds: append([action.id]) }));
	}
}
