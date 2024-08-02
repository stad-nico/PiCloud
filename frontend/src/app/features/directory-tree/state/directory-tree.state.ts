import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { compose, StateOperator } from '@ngxs/store/operators';
import { DirectoryTreeActions } from 'src/app/features/directory-tree/state/directory-tree.actions';

export type Leaf = { name: string; hasChildren: false; isSelected: boolean; id: number };

export type Node = { name: string; hasChildren: true; isCollapsed: boolean; children: Array<Node | Leaf>; isSelected: boolean; id: number };

export type DirectoryTreeItemMetadata = { name: string; hasChildren: boolean; isCollapsed: boolean; children: Array<DirectoryTreeItemMetadata> };

export const DirectoryTreeStateToken = 'directory_tree';

export type DirectoryTreeStateModel = Node | Leaf;

@State<DirectoryTreeStateModel>({
	name: DirectoryTreeStateToken,
	defaults: {
		name: 'root',
		hasChildren: true,
		isCollapsed: false,
		isSelected: false,
		id: 0,
		children: [
			{ name: 'example1', hasChildren: false, isSelected: false, id: 1 },
			{ name: 'example2', hasChildren: false, isSelected: false, id: 2 },
			{
				name: 'example3',
				hasChildren: true,
				isCollapsed: false,
				isSelected: false,
				id: 3,
				children: [
					{
						name: 'test',
						hasChildren: true,
						isCollapsed: false,
						isSelected: false,
						id: 4,
						children: [
							{
								name: 'test',
								hasChildren: false,
								isSelected: false,
								id: 5,
							},
						],
					},
				],
			},
		],
	},
})
@Injectable()
export class DirectoryTreeState {
	@Action(DirectoryTreeActions.Select)
	public select(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Select) {
		ctx.setState(
			compose(
				patchRecursive((n) => true, { isSelected: false }, false),
				patchRecursive((n) => n.id === action.id, { isSelected: true })
			)
		);
	}

	@Action(DirectoryTreeActions.Collapse)
	public collapse(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Collapse) {
		ctx.setState(patchRecursive((n) => n.id === action.id, { isCollapsed: true }));
	}

	@Action(DirectoryTreeActions.Expand)
	public expand(ctx: StateContext<DirectoryTreeStateModel>, action: DirectoryTreeActions.Expand) {
		ctx.setState(patchRecursive((n) => n.id === action.id, { isCollapsed: false }));
	}
}

function patchRecursive(selector: (n: Node | Leaf) => boolean, obj: Object, stopOnMatch: boolean = true): StateOperator<Node | Leaf> {
	function recursive(nodeOrLeaf: Node | Leaf): Node | Leaf {
		if (selector(nodeOrLeaf)) {
			if (stopOnMatch) {
				return { ...nodeOrLeaf, ...obj };
			} else {
				if (isLeaf(nodeOrLeaf)) {
					return { ...nodeOrLeaf, ...obj };
				} else {
					return { ...nodeOrLeaf, ...obj, children: nodeOrLeaf.children.map((child) => recursive(child)) };
				}
			}
		}

		if (isLeaf(nodeOrLeaf)) {
			return nodeOrLeaf;
		}

		return {
			...nodeOrLeaf,
			children: nodeOrLeaf.children.map((child) => recursive(child)),
		};
	}

	return (state: Node | Leaf) => recursive(state);
}

function isLeaf(leafOrNode: Leaf | Node): leafOrNode is Leaf {
	return !('children' in leafOrNode);
}
