import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { ROOT_ID } from 'src/app/core/components/explorer/state/explorer.state';
import { Crumb } from 'src/app/features/breadcrumbs/components/pure-breadcrumbs/pure-breadcrumbs.component';
import { BreadcrumbsActions } from 'src/app/features/breadcrumbs/state/breadcrumbs.actions';
import { DirectoryTreeState } from 'src/app/features/directory-tree/state/directory-tree.state';

interface BreadcrumbsStateModel {
	crumbs: Array<Crumb>;
}

@State<BreadcrumbsStateModel>({
	name: 'breadcrumbs',
	defaults: {
		crumbs: [],
	},
})
@Injectable()
export class BreadcrumbsState {
	private readonly store: Store;

	public constructor(store: Store) {
		this.store = store;
	}

	@Selector()
	public static getCrumbs(state: BreadcrumbsStateModel) {
		return state.crumbs;
	}

	@Action(BreadcrumbsActions.Add)
	public add(ctx: StateContext<BreadcrumbsStateModel>, action: BreadcrumbsActions.Add) {
		ctx.setState(patch({ crumbs: [...action.crumbs, ...ctx.getState().crumbs] }));
	}

	@Action(BreadcrumbsActions.Set)
	public set(ctx: StateContext<BreadcrumbsStateModel>, action: BreadcrumbsActions.Set) {
		ctx.setState(patch({ crumbs: [...action.crumbs] }));
	}

	@Action(BreadcrumbsActions.BuildCrumbs)
	public buildCrumbs(ctx: StateContext<BreadcrumbsStateModel>, action: BreadcrumbsActions.BuildCrumbs) {
		const tree = this.store.selectSnapshot(DirectoryTreeState.getTree);

		let currentId: string | null = action.id;
		let crumbs: Array<Crumb> = [];

		while (currentId !== ROOT_ID) {
			const parentId = Object.keys(tree).find((key) => tree[key].some((directory) => directory.id === currentId));

			if (!parentId) {
				throw new Error('parentId undefined');
			}

			crumbs.unshift(tree[parentId].find((item) => item.id === currentId)!);

			currentId = parentId;
		}

		crumbs.unshift({ name: 'root', id: ROOT_ID });

		ctx.dispatch(new BreadcrumbsActions.Set(crumbs));
	}
}
