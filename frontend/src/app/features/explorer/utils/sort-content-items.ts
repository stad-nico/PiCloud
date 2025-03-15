import { ExplorerContentItem } from 'src/app/features/explorer/types/explorer-content-item';

export function sortContentItems(contentItems: Array<ExplorerContentItem>): Array<ExplorerContentItem> {
	return contentItems.sort((a, b) => {
		if (a.isDirectory && !b.isDirectory) {
			return -1;
		}

		if (!a.isDirectory && b.isDirectory) {
			return 1;
		}

		return a.name.localeCompare(b.name);
	});
}
