import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Action, Selector, State, StateContext } from '@ngxs/store';

export class GetPath {
	static readonly type = '[Path] Get path';

	public constructor(public readonly route: ActivatedRoute) {}
}

@State<string>({
	name: 'path',
	defaults: 'root',
})
@Injectable()
export class PathState {
	@Selector()
	public static path(state: string) {
		return state;
	}

	@Action(GetPath)
	public getPath(ctx: StateContext<string>, action: GetPath) {
		action.route.url.subscribe((segments) => {
			const path = segments.map((x) => x.path).join('/');

			ctx.setState(path);
		});
	}
}
