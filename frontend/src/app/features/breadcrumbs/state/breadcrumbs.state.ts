import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { Crumb } from 'src/app/features/breadcrumbs/components/pure-breadcrumbs/pure-breadcrumbs.component';
import { BreadcrumbsActions } from 'src/app/features/breadcrumbs/state/breadcrumbs.actions';

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
	@Selector()
	public static getCrumbs(state: BreadcrumbsStateModel) {
		return state.crumbs;
	}

	@Action(BreadcrumbsActions.Add)
	public add(ctx: StateContext<BreadcrumbsStateModel>, action: BreadcrumbsActions.Add) {
		ctx.setState(patch({ crumbs: [action, ...ctx.getState().crumbs] }));
	}
}
