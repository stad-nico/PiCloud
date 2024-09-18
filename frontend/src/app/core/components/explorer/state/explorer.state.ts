import { Injectable } from '@angular/core';
import { Navigate } from '@ngxs/router-plugin';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { DirectoriesService, FilesService } from 'generated';
import { EMPTY, expand, map, of, switchMap, takeLast, tap } from 'rxjs';
import { ExplorerActions } from 'src/app/core/components/explorer/state/explorer.actions';
import { BreadcrumbsActions } from 'src/app/features/breadcrumbs/state/breadcrumbs.actions';
import { ContentListActions } from 'src/app/features/content-list/state/content-list.actions';
import { DirectoryTreeActions } from 'src/app/features/directory-tree/state/directory-tree.actions';

export const ROOT_ID = 'root';

interface Common {
	id: string;
	name: string;
	size: number;
	createdAt: string;
	updatedAt: string;
}

export enum Type {
	File,
	Directory,
}

export interface File extends Common {
	type: Type.File;
	mimeType: string;
}

export interface Directory extends Common {
	type: Type.Directory;
	files: number;
	directories: number;
}

export interface Tree {
	[id: string]: Array<File | Directory>;
}

export interface DirectoriesOnlyTree {
	[id: string]: Array<Directory>;
}

export interface TreeRoot {
	id: string;
	name: string;
}

export interface ExplorerStateModel {
	directory: string;
	showCreateDirectoryComponent: boolean;
	isRoot: boolean;
	tree: Tree;
}

const SortDirectoriesFirstThenAlphabetically = (a: File | Directory, b: File | Directory) => {
	return a.type !== b.type ? b.type - a.type : a.name.localeCompare(b.name);
};

@State<ExplorerStateModel>({
	name: 'explorer',
	defaults: {
		directory: '',
		showCreateDirectoryComponent: false,
		isRoot: false,
		tree: {},
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

	@Selector()
	public static getContent(state: ExplorerStateModel) {
		return state.tree[state.directory] ?? [];
	}

	@Selector()
	public static getTree(state: ExplorerStateModel) {
		return state.tree;
	}

	@Action(ExplorerActions.SetDirectory)
	public setDirectory(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.SetDirectory) {
		ctx.setState(
			patch({
				directory: action.id,
				isRoot: ROOT_ID === action.id,
			})
		);
	}

	@Action(ExplorerActions.Open)
	public open(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.Open) {
		if (action.type === Type.File) {
			const item = ctx.getState().tree[ctx.getState().directory].find((item) => item.id === action.id);

			if (!item || item.type === Type.Directory) {
				return;
			}

			return this.filesService.downloadFile(ctx.getState().directory, action.id).pipe(
				tap((body) => {
					const tab = window.open(URL.createObjectURL(body));

					if (!tab) {
						return;
					}

					tab.addEventListener('load', () => {
						tab.document.title = item.name;
					});
				})
			);
		}

		if (ctx.getState().directory === action.id) {
			return;
		}

		return ctx.dispatch([new ContentListActions.UnselectAll(), new Navigate(['explorer', action.id])]);
	}

	@Action(ExplorerActions.LoadInitialContent)
	public loadInitialContent(ctx: StateContext<ExplorerStateModel>) {
		const mergeTrees = (a: Tree, b: Tree) => ({ ...a, ...b });

		return of({ tree: {}, crumbs: [], id: ctx.getState().directory }).pipe(
			expand((d) =>
				!d.id
					? EMPTY
					: this.directoriesService.getMetadata(d.id).pipe(
							switchMap((metadata) =>
								this.directoriesService.getContents(d.id).pipe(
									map((contents) => ({
										[d.id]: [
											...contents.directories.map((directory) => ({ type: Type.Directory as Type.Directory, ...directory })),
											...contents.files.map((file) => ({ type: Type.File as Type.File, ...file })),
										].sort(SortDirectoriesFirstThenAlphabetically),
									})),
									map((contents) => ({
										tree: mergeTrees(d.tree, contents),
										crumbs: [{ id: d.id, name: metadata.name }, ...d.crumbs],
										id: metadata.parentId,
									}))
								)
							)
						)
			),
			takeLast(1),
			tap(({ tree }) => ctx.setState(patch({ tree: patch(tree) }))),
			tap(({ tree, crumbs }) => ctx.dispatch([new BreadcrumbsActions.Set(crumbs), ...Object.keys(tree).map((id) => new DirectoryTreeActions.Expand(id))]))
		);
	}

	@Action(ExplorerActions.LoadContent)
	public loadContent(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.LoadContent) {
		if (action.id in ctx.getState().tree) {
			console.log('Skipped because already in state');
			return;
		}

		return this.directoriesService.getContents(action.id).pipe(
			map((contents) =>
				[
					...contents.directories.map((directory) => ({ type: Type.Directory as Type.Directory, ...directory })),
					...contents.files.map((file) => ({ type: Type.File as Type.File, ...file })),
				].sort(SortDirectoriesFirstThenAlphabetically)
			),
			tap((contents) =>
				ctx.setState(
					patch({
						tree: patch({
							[action.id]: contents,
						}),
					})
				)
			)
		);
	}

	@Action(ExplorerActions.CreateDirectory)
	public createDirectory(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.CreateDirectory) {
		const parentId = ctx.getState().directory;
		const grandparentId = Object.keys(ctx.getState().tree).find((key) => ctx.getState().tree[key].some((item) => item.id === parentId));

		return this.directoriesService.create(parentId, action).pipe(
			switchMap((body) =>
				this.directoriesService.getMetadata(body.id).pipe(
					map((metadata) => ({ id: body.id, ...metadata })),
					tap((metadata) =>
						ctx.setState(
							patch({
								tree: patch(
									grandparentId
										? {
												[grandparentId]: updateItem((item) => item.id === parentId, patch({ directories: (amt) => amt + 1 })),
												[parentId]: append([{ type: Type.Directory, ...metadata }]),
											}
										: { [parentId]: append([{ type: Type.Directory, ...metadata }]) }
								),
							})
						)
					)
				)
			),
			tap(() => ctx.dispatch(new ExplorerActions.HideCreateDirectoryComponent()))
		);
	}

	@Action(ExplorerActions.DeleteDirectory)
	public deleteDirectory(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.DeleteDirectory) {
		const parentId = ctx.getState().directory;
		const grandparentId = Object.keys(ctx.getState().tree).find((key) => ctx.getState().tree[key].some((item) => item.id === parentId));

		return this.directoriesService._delete(action.id).pipe(
			tap(() =>
				ctx.setState(
					patch({
						tree: patch(
							grandparentId
								? {
										[grandparentId]: updateItem((item) => item.id === parentId, patch({ directories: (amt) => amt - 1 })),
										[parentId]: removeItem((item) => item.id === action.id),
									}
								: {
										[parentId]: removeItem((item) => item.id === action.id),
									}
						),
					})
				)
			)
		);
	}

	@Action(ExplorerActions.UploadFile)
	public uploadFile(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.UploadFile) {
		const directoryId = ctx.getState().directory;
		const grandparentId = Object.keys(ctx.getState().tree).find((key) => ctx.getState().tree[key].some((item) => item.id === directoryId));

		return this.filesService.upload(directoryId, action.file).pipe(
			switchMap((body) =>
				this.filesService.getFileMetadata(directoryId, body.id).pipe(
					map((metadata) => ({ id: body.id, ...metadata })),
					tap((metadata) =>
						ctx.setState(
							patch({
								tree: patch(
									grandparentId
										? {
												[grandparentId]: updateItem(
													(item) => item.id === directoryId,
													patch({ files: (amt) => amt + 1, size: (s) => s + metadata.size })
												),
												[directoryId]: append([{ type: Type.File, ...metadata }]),
											}
										: { [directoryId]: append([{ type: Type.File, ...metadata }]) }
								),
							})
						)
					)
				)
			)
		);
	}

	@Action(ExplorerActions.DeleteFile)
	public deleteFile(ctx: StateContext<ExplorerStateModel>, action: ExplorerActions.DeleteFile) {
		const directoryId = ctx.getState().directory;
		const size = ctx.getState().tree[directoryId].find((item) => item.id === action.id)?.size;

		if (!size) {
			return;
		}

		const grandparentId = Object.keys(ctx.getState().tree).find((key) => ctx.getState().tree[key].some((item) => item.id === directoryId));

		return this.filesService.deleteFile(directoryId, action.id).pipe(
			tap(() =>
				ctx.setState(
					patch({
						tree: patch(
							grandparentId
								? {
										[grandparentId]: updateItem(
											(item) => item.id === directoryId,
											patch({ files: (amt) => amt - 1, size: (s) => s - size })
										),
										[directoryId]: removeItem((item) => item.id === action.id),
									}
								: {
										[directoryId]: removeItem((item) => item.id === action.id),
									}
						),
					})
				)
			)
		);
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
}
