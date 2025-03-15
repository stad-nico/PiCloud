import { ExplorerTreeNode } from 'src/app/features/explorer/types/explorer-tree-node';

export function sortTreeNodes(treeNodes: Array<ExplorerTreeNode>) {
	return treeNodes.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});
}
