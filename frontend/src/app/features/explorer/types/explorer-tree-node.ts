import { TreeNode } from '@pihub/components/tree';

export interface ExplorerTreeNode extends TreeNode {
	readonly name: string;

	readonly isLoading: boolean;
}
