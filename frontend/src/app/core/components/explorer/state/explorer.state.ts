import { Injectable } from '@angular/core';
import { Navigate } from '@ngxs/router-plugin';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { DirectoriesService, FilesService } from 'generated';
import { map, switchMap, tap } from 'rxjs';
import { ExplorerActions } from 'src/app/core/components/explorer/state/explorer.actions';
import { Type } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListActions } from 'src/app/features/content-list/state/content-list.actions';
import { DirectoryTreeActions } from 'src/app/features/directory-tree/state/directory-tree.actions';

export const ROOT_ID = 'root';

export interface ExplorerStateModel {
	directory: string;
	showCreateDirectoryComponent: boolean;
	isRoot: boolean;
}

@State<ExplorerStateModel>({
	name: 'explorer',
	defaults: {
		directory: '',
		showCreateDirectoryComponent: false,
		isRoot: false,
	},
})
@Injectable()
export class ExplorerState {
	private readonly directoriesService: DirectoriesService;

	private readonly filesService: FilesService;

	public constructor(directoriesService: DirectoriesService, filesService: FilesService) {
		this.directoriesService = directoriesService;
		this.filesService = filesService;
	}

	@Selector()
	public static getDirectory(state: ExplorerStateModel): string {
		return state.directory;
	}

	@Selector()
	public static getCreateDirectoryInfo(state: ExplorerStateModel) {
		return {
			isRoot: state.isRoot,
			showCreateDirectoryComponent: state.showCreateDirectoryComponent,
		};
	}

	@Action(ExplorerActions.Open)
	public open(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.Open) {
		if (ctx.getState().directory === action.id) {
			return;
		}

		ctx.setState(
			patch({
				directory: action.id,
				isRoot: action.id === ROOT_ID,
			})
		);

		ctx.dispatch(new Navigate(['explorer', action.id]));
	}

	@Action(ExplorerActions.ShowCreateDirectoryComponent)
	public showDirectoryCreationWidget(ctx: StateContext<ExplorerStateModel>) {
		return ctx.dispatch(new ContentListActions.UnselectAll()).pipe(
			tap(() => {
				ctx.setState(
					patch({
						showCreateDirectoryComponent: true,
					})
				);
			})
		);
	}

	@Action(ExplorerActions.HideCreateDirectoryComponent)
	public hideDirectoryCreationWidget(ctx: StateContext<ExplorerStateModel>) {
		ctx.setState(
			patch({
				showCreateDirectoryComponent: false,
			})
		);
	}

	@Action(ExplorerActions.CreateDirectory)
	public createDirectory(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.CreateDirectory) {
		return this.directoriesService.create(ctx.getState().directory, { name: action.name }).pipe(
			switchMap((body) => this.directoriesService.getMetadata(body.id).pipe(map((metadata) => ({ id: body.id, ...metadata })))),
			tap((directory) =>
				ctx.dispatch([
					new ExplorerActions.HideCreateDirectoryComponent(),
					new ContentListActions.AddItem({ type: Type.Directory, isBeingProcessed: false, isSelected: false, ...directory }),
					new DirectoryTreeActions.AddDirectory(directory),
				])
			)
		);
	}

	@Action(ExplorerActions.DeleteDirectory)
	public deleteDirectory(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.DeleteDirectory) {
		return this.directoriesService
			._delete(action.id)
			.pipe(tap(() => ctx.dispatch([new ContentListActions.RemoveItem(action.id), new DirectoryTreeActions.RemoveDirectory(action.id)])));
	}

	@Action(ExplorerActions.DeleteFile)
	public deleteFile(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.DeleteFile) {
		return this.filesService.deleteFile(ctx.getState().directory, action.id).pipe(tap(() => ctx.dispatch([new ContentListActions.RemoveItem(action.id)])));
	}

	@Action(ExplorerActions.Upload)
	public upload(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.Upload) {
		const directoryId = ctx.getState().directory;

		return this.filesService.upload(directoryId, action.file).pipe(
			switchMap((body) => this.filesService.getFileMetadata(directoryId, body.id).pipe(map((metadata) => ({ id: body.id, ...metadata })))),
			tap((file) => ctx.dispatch([new ContentListActions.AddItem({ type: Type.File, isBeingProcessed: false, isSelected: false, ...file })]))
		);
	}
}
