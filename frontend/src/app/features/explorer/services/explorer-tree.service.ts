import { computed, inject, Injectable, Injector, ResourceRef, signal } from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { DirectoryService, GetDirectoryContentsResponse, GetDirectoryMetadataResponse } from 'generated';
import { filter, map, Observable, skip, switchMap, take, tap } from 'rxjs';
import { ExplorerTreeNode } from 'src/app/features/explorer/types/explorer-tree-node';
import { sortTreeNodes } from 'src/app/features/explorer/utils/sort-tree-nodes';

interface Tree {
	root: ExplorerTreeNode;
	children: Array<ExplorerTreeNode>;
}

@Injectable({ providedIn: 'root' })
export class ExplorerTreeService {
	/**
	 * The service that fetches directory data from the backend.
	 */
	private readonly directoryService = inject(DirectoryService);

	/**
	 * The injector used to create resources.
	 */
	private readonly injector = inject(Injector);

	/**
	 * The resources for the directory subtrees.
	 */
	private readonly resources = signal(new Map<string, ResourceRef<Tree | undefined>>());

	/**
	 * The current directory id.
	 */
	public readonly directoryId = signal<string | null>(null);

	/**
	 * The observable for the current directory id.
	 */
	private readonly directoryId$ = toObservable(this.directoryId).pipe(filter((id) => id !== null));

	/**
	 * Creates a resource for a directory subtree if it does not exist yet.
	 */
	private readonly createSubtreeResource$ = this.directoryId$.pipe(
		skip(1),
		tap((id) => {
			this.expandedIds.update((ids) => [...ids, id]);

			if (!this.resources().has(id)) {
				this.createDirectoryResource(id);
			}
		})
	);

	/**
	 * Creates resources for the initial directory structure.
	 */
	private readonly createInitialResources$ = this.directoryId$.pipe(
		take(1),
		switchMap((id) => this.directoryService.getDirectoryMetadata(id)),
		tap((metadata) => {
			this.expandedIds.set(metadata.idChain);

			for (const id of metadata.idChain) {
				this.createDirectoryResource(id);
			}
		})
	);

	/**
	 * The tree of the current directory.
	 */
	public readonly tree = computed(() => {
		const resources = [...this.resources().values()];

		const trees = resources.map((resource) => resource.value()).filter((tree) => tree !== undefined);

		const nodes = this.mergeTrees(trees);

		return sortTreeNodes(nodes);
	});

	/**
	 * The expanded directory ids.
	 */
	public readonly expandedIds = signal<Array<string>>([]);

	public constructor() {
		this.createSubtreeResource$.subscribe();
		this.createInitialResources$.subscribe();
	}

	public loadDirectory(directoryId: string): void {
		const resource = this.resources().get(directoryId);

		if (resource) {
			return;
		}

		this.createDirectoryResource(directoryId);
	}

	/**
	 * Reloads the tree of the given directory or the current directory recursively.
	 *
	 * @param directoryId the optional id of the directory to reload
	 */
	public reload(directoryId?: string): void {
		const id = directoryId ?? this.directoryId();

		if (!id) {
			return;
		}

		const resource = this.resources().get(id);

		if (!resource) {
			return;
		}

		resource.reload();
		resource.value()?.children.forEach((child) => this.reload(child.id));
	}

	/**
	 * Creates a resource for a directory subtree.
	 *
	 * @param id the id of the directory
	 */
	private createDirectoryResource(id: string): void {
		/* this is needed to defer the creation of the resource */
		setTimeout(() => {
			const resource = rxResource({
				injector: this.injector,
				request: () => id,
				loader: ({ request }) => this.loadDirectorySubtree(request),
			});

			this.resources.set(new Map([...this.resources(), [id, resource]]));
		}, 0);
	}

	/**
	 * Loads a directory subtree with its immediate children.
	 *
	 * @param directoryId the id of the directory
	 * @returns observable of the subtree
	 */
	private loadDirectorySubtree(directoryId: string): Observable<Tree> {
		return this.directoryService
			.getDirectoryMetadata(directoryId)
			.pipe(
				switchMap((metadata) =>
					this.directoryService
						.getDirectoryContents(metadata.id)
						.pipe(map((contents) => this.createDirectorySubtree(metadata, contents)))
				)
			);
	}

	/**
	 * Creates a subtree from a directory.
	 *
	 * @param metadata the directory metadata
	 * @param contents the directory contents
	 * @returns the subtree
	 */
	private createDirectorySubtree(metadata: GetDirectoryMetadataResponse, contents: GetDirectoryContentsResponse): Tree {
		return {
			root: this.createDirectoryTreeNode(metadata, contents),
			children: this.createSubdirectoryTreeNodes(metadata, contents),
		};
	}

	/**
	 * Creates a tree node for a directory.
	 *
	 * @param metadata the directory metadata
	 * @param contents the directory contents
	 * @returns the tree node
	 */
	private createDirectoryTreeNode(metadata: GetDirectoryMetadataResponse, contents: GetDirectoryContentsResponse): ExplorerTreeNode {
		return {
			id: metadata.id,
			name: metadata.name,
			parentId: metadata.parentId,
			childrenIds: contents.directories.map((d) => d.id),
			hasChildren: contents.directories.length > 0,
			isLoading: false,
		};
	}

	/**
	 * Creates the tree nodes for the immediate subdirectories of a directory.
	 *
	 * @param metadata the directory metadata
	 * @param contents the contents
	 * @returns the tree nodes
	 */
	private createSubdirectoryTreeNodes(
		metadata: GetDirectoryMetadataResponse,
		contents: GetDirectoryContentsResponse
	): Array<ExplorerTreeNode> {
		return contents.directories.map((directory) => ({
			id: directory.id,
			name: directory.name,
			parentId: metadata.id,
			childrenIds: [],
			hasChildren: directory.hasSubdirectories,
			isLoading: false,
		}));
	}

	/**
	 * Merges multiple trees into a single list of nodes.
	 *
	 * @param trees the trees to merge
	 * @returns the merged list of nodes
	 */
	private mergeTrees(trees: Array<Tree>): Array<ExplorerTreeNode> {
		const nodes = new Map(trees.flatMap((tree) => [tree.root, ...tree.children]).map((node) => [node.id, node]));
		const parentMap = new Map(trees.flatMap((tree) => tree.children.map((child) => [child.id, tree.root.id])));
		const childMap = new Map(trees.map((tree) => [tree.root.id, tree.children.map((child) => child.id)]));

		return [...nodes.values()]
			.map((node) => ({ ...node, childrenIds: childMap.get(node.id) ?? [], parentId: parentMap.get(node.id) }))
			.filter((node) => node.parentId);
	}
}
