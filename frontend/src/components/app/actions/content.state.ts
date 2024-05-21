import { Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { DirectoryContentDirectory, DirectoryContentFile, DirectoryService } from 'generated';
import { tap } from 'rxjs';

export const ContentListStateName = 'content_list';

export type ContentListStateType = {
	[ContentListStateName]: ContentListStateModel;
};

export class GetContentListContent {
	static readonly type = '[Content List] Get content';

	constructor(public path: string) {}
}

export interface ContentListStateModel {
	directories: DirectoryContentDirectory[];
	files: DirectoryContentFile[];
}

@State<ContentListStateModel>({
	name: ContentListStateName,
})
@Injectable()
export class ContentListState {
	constructor(
		private readonly directoryService: DirectoryService,
		private readonly store: Store
	) {}

	@Action(GetContentListContent)
	get(ctx: StateContext<ContentListStateModel>, action: GetContentListContent) {
		return this.directoryService.getDirectoryContent(action.path).pipe(
			tap((content) => {
				ctx.patchState({
					directories: content.directories,
					files: content.files,
				});
			})
		);
	}
}
