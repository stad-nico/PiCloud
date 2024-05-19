import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { DirectoryService } from 'generated';
import { map, tap } from 'rxjs';
import { GetTreeSubDirectories } from 'src/components/app/actions/directory';

export interface TreeStateModel {
	[key: string]: {
		children: string[];
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
			tap((mappedContent) =>
				ctx.patchState({
					[action.path]: {
						children: mappedContent,
					},
				})
			)
		);
	}
}
