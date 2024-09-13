import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, compose, iif, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { DirectoriesService, DirectoryContentResponse } from 'generated';
import { concatMap, from, ignoreElements, merge, switchMap, take, takeWhile, tap, timer, toArray } from 'rxjs';
import { ROOT_ID } from 'src/app/core/components/explorer/state/explorer.state';
import { BreadcrumbsActions } from 'src/app/features/breadcrumbs/state/breadcrumbs.actions';
import { DirectoryTreeActions } from 'src/app/features/directory-tree/state/directory-tree.actions';

interface DirectoryTreeStateModel {
	isLoading: boolean;
	lastSelectedId: string | undefined;
	root: Node;
	tree: TreeModel;
}

export interface TreeModel {
	[id: string]: Array<Node>;
}

export interface Node {
	id: string;
	name: string;
	isCollapsed: boolean;
	hasChildren: boolean;
	isSelected: boolean;
}

@State<DirectoryTreeStateModel>({
	name: 'directory_tree',
	defaults: {
		isLoading: true,
		lastSelectedId: undefined,
		tree: {},
		root: {
			name: 'root',
			id: ROOT_ID,
			isCollapsed: false,
			isSelected: false,
			hasChildren: true,
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
	public static getTree(state: DirectoryTreeStateModel) {
		return state.tree;
	}

	@Selector()
	public static getIsLoading(state: DirectoryTreeStateModel) {
		return state.isLoading;
	}

	@Action(DirectoryTreeActions.AddDirectory)
	public addDirectory(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.AddDirectory) {
		const parentId = action.directory.parentId;
		const grandparentId = this.getParentId(ctx, action.directory.parentId);

		if (!grandparentId) {
			throw new Error('NO GRANDPARENT');
		}

		ctx.setState(
			patch({
				tree: iif(
					grandparentId in ctx.getState().tree,
					patch({
						[grandparentId]: updateItem(
							(item) => item.id === parentId,
							patch({
								hasChildren: (ctx.getState().tree[parentId]?.length || 1) > 0,
								isCollapsed: (ctx.getState().tree[parentId]?.length || 1) <= 0,
							})
						),
						[parentId]: append([{ isCollapsed: true, isSelected: false, hasChildren: false, ...action.directory }]),
					}),
					patch({
						[parentId]: append([{ isCollapsed: true, isSelected: false, hasChildren: false, ...action.directory }]),
					})
				),
			})
		);
	}

	@Action(DirectoryTreeActions.RemoveDirectory)
	public removeDirectory(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.RemoveDirectory) {
		const parentId = this.getParentId(ctx, action.id);
		const grandparentId = this.getParentId(ctx, parentId);

		if (!parentId) {
			throw new Error('parentId not defined');
		}

		if (!grandparentId) {
			throw new Error('NO GRANDPARENT');
		}

		ctx.setState(
			patch({
				tree: patch({
					[parentId]: removeItem((item) => item.id === action.id),
					[grandparentId]: updateItem((item) => item.id === parentId, patch({ hasChildren: ctx.getState().tree[parentId].length - 1 > 0 })),
				}),
			})
		);
	}

	@Action(DirectoryTreeActions.FetchInitialContent)
	public fetchInitialContent(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.FetchInitialContent) {
		const updateState = (contents: DirectoryContentResponse) => {
			ctx.setState(
				patch({
					tree: patch({
						[currentId]: contents.directories.map((directory) => ({
							...directory,
							hasChildren: directory.directories > 0,
							isCollapsed: directory.name !== name,
							isSelected: directory.id === action.id,
						})),
					}),
				})
			);
		};

		let currentId = action.id;
		let name = '';

		return merge(
			from(currentId).pipe(
				concatMap(() => {
					return this.directoriesService.getContents(currentId).pipe(
						tap(updateState),
						switchMap(() =>
							this.directoriesService.getMetadata(currentId).pipe(
								tap((metadata) => {
									ctx.dispatch(new BreadcrumbsActions.Add([{ name: metadata.name, id: currentId }]));
									currentId = metadata.parentId;
									name = metadata.name;
								})
							)
						)
					);
				}),
				takeWhile((metadata) => metadata.parentId !== null),
				tap(() => ctx.setState(patch({ lastSelectedId: action.id }))),
				toArray()
			),
			timer(200).pipe(
				// tap(() => alert('LOADING')),
				ignoreElements()
			)
		).pipe(take(1));
	}

	@Action(DirectoryTreeActions.FetchContent)
	public fetchContent(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.FetchContent) {
		if (action.id in ctx.getState().tree) {
			return;
		}

		const updateState = (contents: DirectoryContentResponse) => {
			ctx.setState(
				patch({
					tree: patch({
						[action.id]: contents.directories.map((directory) => ({
							...directory,
							hasChildren: directory.directories > 0,
							isCollapsed: true,
							isSelected: directory.id === action.id,
						})),
					}),
				})
			);
		};

		return this.directoriesService.getContents(action.id).pipe(tap(updateState));
	}

	@Action(DirectoryTreeActions.Collapse)
	public collapse(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Collapse) {
		const parentId = this.getParentId(ctx, action.id);

		if (!parentId) {
			throw new Error('parentId not defined');
		}

		ctx.setState(
			patch({
				tree: patch({
					[parentId]: updateItem((item) => item.id === action.id, patch({ isCollapsed: true })),
				}),
			})
		);
	}

	@Action(DirectoryTreeActions.Expand)
	public expand(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Expand) {
		const parentId = this.getParentId(ctx, action.id);

		if (!parentId) {
			throw new Error('parentId not defined');
		}

		ctx.setState(
			patch({
				tree: patch({
					[parentId]: updateItem((item) => item.id === action.id, patch({ isCollapsed: false })),
				}),
			})
		);
	}

	@Action(DirectoryTreeActions.Select)
	public select(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Select) {
		const lastSelectedId = ctx.getState().lastSelectedId;

		const parentId = this.getParentId(ctx, action.id);
		const lastSelectedParentId = this.getParentId(ctx, lastSelectedId);

		if (!parentId) {
			if (action.id === ROOT_ID) {
				ctx.setState(
					patch({ tree: patch({ [lastSelectedParentId!]: updateItem((item) => item.id === lastSelectedId, patch({ isSelected: false })) }) })
				);
				return;
			}

			throw new Error('parentId undefined');
		}

		const patchObj = { isSelected: true, isCollapsed: false };

		ctx.setState(
			patch({
				tree: iif(
					!lastSelectedParentId,
					patch({
						[parentId]: updateItem((directory) => directory.id === action.id, patch(patchObj)),
					}),
					iif(
						lastSelectedParentId !== parentId,
						patch({
							[lastSelectedParentId!]: updateItem((directory) => directory.id === lastSelectedId, patch({ isSelected: false })),
							[parentId]: updateItem((directory) => directory.id === action.id, patch(patchObj)),
						}),
						patch({
							[parentId]: compose(
								updateItem((directory) => directory.id === lastSelectedId, patch({ isSelected: false })),
								updateItem((directory) => directory.id === action.id, patch(patchObj))
							),
						})
					)
				),
				lastSelectedId: action.id,
			})
		);
	}

	private getParentId(ctx: StateContext<DirectoryTreeStateModel>, id: string | undefined) {
		const tree = ctx.getState().tree;

		const parentId = Object.keys(tree).find((key) => tree[key].some((directory) => directory.id === id));

		return parentId;
	}
}
