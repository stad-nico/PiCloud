import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { DirectoryService } from 'generated';
import { defaultIfEmpty, forkJoin, map, mergeMap, tap } from 'rxjs';

export class GetTreeSubDirectories {
	static readonly type = '[Tree View] Get subdirectories';

	constructor(public path: string) {}
}

export class SetTreeSubDirectories {
	static readonly type = '[Tree View] Set subdirectories';

	constructor(
		public path: string,
		public directories: { name: string; hasChildren: boolean }[]
	) {}
}

export const TreeViewStateName = 'tree_view';

export type TreeViewStateType = {
	[TreeViewStateName]: TreeViewStateModel;
};

export interface TreeViewStateModel {
	[key: string]: {
		children: { name: string; hasChildren: boolean }[];
	};
}

@State<TreeViewStateModel>({
	name: TreeViewStateName,
	defaults: {},
})
@Injectable()
export class TreeViewState {
	constructor(private readonly directoryService: DirectoryService) {}

	@Action(GetTreeSubDirectories)
	get(ctx: StateContext<TreeViewStateModel>, action: GetTreeSubDirectories) {
		return this.directoryService.getDirectoryContent(action.path).pipe(
			map((content) => content.directories.map((directory) => directory.name)),
			mergeMap((directoryNames) => {
				const observables = directoryNames.map((name) =>
					this.directoryService.getDirectoryMetadata(action.path + '/' + name).pipe(
						map((metadata) => ({
							name: metadata.name,
							hasChildren: metadata.directories > 0,
						}))
					)
				);

				return forkJoin(observables).pipe(defaultIfEmpty(null));
			}),
			tap((newState) => {
				ctx.patchState({
					[action.path]: {
						children: newState ?? [],
					},
				});
			})
		);
	}

	@Action(SetTreeSubDirectories)
	set(ctx: StateContext<TreeViewStateModel>, action: SetTreeSubDirectories) {
		ctx.patchState({
			[action.path]: {
				children: action.directories,
			},
		});
	}
}
