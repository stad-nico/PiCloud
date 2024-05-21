import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { DirectoryService } from 'generated';
import { defaultIfEmpty, forkJoin, map, mergeMap, tap } from 'rxjs';
import { GetTreeSubDirectories } from 'src/components/app/actions/directory';

export interface TreeStateModel {
	[key: string]: {
		children: { name: string; hasChildren: boolean }[];
	};
}

@State<TreeStateModel>({
	name: 'tree',
	defaults: {},
})
@Injectable()
export class TreeState {
	constructor(private readonly directoryService: DirectoryService) {}

	@Action(GetTreeSubDirectories)
	get(ctx: StateContext<TreeStateModel>, action: GetTreeSubDirectories) {
		const isDataAlreadyInState = ctx.getState()[action.path] !== undefined;

		if (isDataAlreadyInState) {
			return;
		}

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
}
