import { computed, inject, Injectable, linkedSignal, resource, ResourceStatus, signal } from '@angular/core';
import { DirectoryService, GetDirectoryContentsResponse } from 'generated';
import { firstValueFrom } from 'rxjs';
import { ExplorerContentItem } from 'src/app/features/explorer/types/explorer-content-item';
import { sortContentItems } from './../utils/sort-content-items';

@Injectable({ providedIn: 'root' })
export class ExplorerContentService {
	/**
	 * The service that fetches directory data from the backend.
	 */
	private readonly directoryService = inject(DirectoryService);

	/**
	 * The cache for directory contents.
	 */
	private readonly cache = new Map<string, Array<ExplorerContentItem>>();

	/**
	 * Resource that loads the contents of the current directory if not already loaded.
	 */
	private readonly contentsResource = resource({
		request: () => ({ directoryId: this.directoryId() }),
		loader: async ({ request }) => {
			const { directoryId } = request;

			if (!directoryId) {
				return [];
			}

			const maybeCachedContents = this.cache.get(directoryId);

			if (maybeCachedContents) {
				return maybeCachedContents;
			}

			const response = await firstValueFrom(this.directoryService.getDirectoryContents(directoryId));
			const contents = this.mapToExplorerContentItems(response);

			this.cache.set(directoryId, contents);

			return contents;
		},
	});

	/**
	 * Whether the `isLoading` signal should be updated when (re)loading the resource.
	 */
	private readonly shouldUpdateLoadingSignal = linkedSignal(
		() => this.contentsResource.status() === ResourceStatus.Resolved || this.contentsResource.status() === ResourceStatus.Idle
	);

	/**
	 * The current directory id.
	 */
	public readonly directoryId = signal<string | null>(null);

	/**
	 * The contents of the current directory.
	 */
	public readonly contents = computed(() => sortContentItems(this.contentsResource.value() ?? []));

	/**
	 * Whether the contents of the current directory are being loaded.
	 */
	public readonly isLoading = computed(() => this.contentsResource.isLoading() && this.shouldUpdateLoadingSignal());

	/**
	 * Reloads the contents of the current directory but does not update the `isLoading` signal.
	 * This enables optimistic updates.
	 */
	public softReload(): void {
		const directoryId = this.directoryId();

		if (!directoryId) {
			return;
		}

		this.shouldUpdateLoadingSignal.set(false);

		this.clearCache(directoryId);
		this.contentsResource.reload();
	}

	public getContentById(id: string): ExplorerContentItem | undefined {
		return [...this.cache.values()].flat().find((content) => content.id === id);
	}

	/**
	 * Reloads the contents of the current directory.
	 */
	public reload(): void {
		const directoryId = this.directoryId();

		if (!directoryId) {
			return;
		}

		this.clearCache(directoryId);
		this.contentsResource.reload();
	}

	/**
	 * Clears the cache of all directory contents or the cache for a specific directory.
	 *
	 * @param directoryId the optional id of the directory to clear the cache for
	 */
	private clearCache(directoryId?: string): void {
		directoryId ? this.cache.delete(directoryId) : this.cache.clear();
	}

	/**
	 * Maps a `GetDirectoryContentsResponse` to an array of `ExplorerContentItem`.
	 *
	 * @param response the directory contents response
	 * @returns the array of explorer content items
	 */
	private mapToExplorerContentItems(response: GetDirectoryContentsResponse): Array<ExplorerContentItem> {
		const files = response.files.map((file) => ({ ...file, isDirectory: false }));
		const directories = response.directories.map((directory) => ({ ...directory, isDirectory: true }));

		return [...files, ...directories];
	}
}
