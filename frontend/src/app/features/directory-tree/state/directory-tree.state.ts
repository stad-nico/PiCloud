import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem } from '@ngxs/store/operators';
import { DirectoriesService } from 'generated';
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
	private directoriesService: DirectoriesService;

	constructor(directoriesService: DirectoriesService) {
		this.directoriesService = directoriesService;
	}

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

	// @Action(DirectoryTreeActions.FetchInitialContent)
	// public fetchInitialContent(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.FetchInitialContent) {
	// 	const updateState = (contents: DirectoryContentResponse) => {
	// 		ctx.setState(
	// 			patch({
	// 				tree: patch({
	// 					[currentId]: contents.directories.map((directory) => ({
	// 						...directory,
	// 						hasChildren: directory.directories > 0,
	// 						isCollapsed: directory.name !== name,
	// 						isSelected: directory.id === action.id,
	// 					})),
	// 				}),
	// 			})
	// 		);
	// 	};

	// 	let currentId = action.id;
	// 	let name = '';

	// 	return merge(
	// 		from(currentId).pipe(
	// 			concatMap(() => {
	// 				return this.directoriesService.getContents(currentId).pipe(
	// 					tap(updateState),
	// 					switchMap(() =>
	// 						this.directoriesService.getMetadata(currentId).pipe(
	// 							tap((metadata) => {
	// 								ctx.dispatch(new BreadcrumbsActions.Add([{ name: metadata.name, id: currentId }]));
	// 								currentId = metadata.parentId;
	// 								name = metadata.name;
	// 							})
	// 						)
	// 					)
	// 				);
	// 			}),
	// 			takeWhile((metadata) => metadata.parentId !== null),
	// 			tap(() => ctx.setState(patch({ lastSelectedId: action.id }))),
	// 			toArray()
	// 		),
	// 		timer(200).pipe(
	// 			// tap(() => alert('LOADING')),
	// 			ignoreElements()
	// 		)
	// 	).pipe(take(1));
	// }

	// @Action(DirectoryTreeActions.FetchContent)
	// public fetchContent(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.FetchContent) {
	// 	if (action.id in ctx.getState().tree) {
	// 		return;
	// 	}

	// 	const updateState = (contents: DirectoryContentResponse) => {
	// 		ctx.setState(
	// 			patch({
	// 				tree: patch({
	// 					[action.id]: contents.directories.map((directory) => ({
	// 						...directory,
	// 						hasChildren: directory.directories > 0,
	// 						isCollapsed: true,
	// 						isSelected: directory.id === action.id,
	// 					})),
	// 				}),
	// 			})
	// 		);
	// 	};

	// 	return this.directoriesService.getContents(action.id).pipe(tap(updateState));
	// }

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
		ctx.setState(
			patch({
				expandedIds: append([action.id]),
			})
		);
	}

	@Action(DirectoryTreeActions.Select)
	public select(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Select) {
		ctx.setState(patch({ selectedId: action.id, expandedIds: append([action.id]) }));
		// ctx.dispatch(new ExplorerActions.LoadContent(action.id));
	}
}
