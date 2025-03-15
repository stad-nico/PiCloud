import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Breadcrumb, BreadcrumbsComponent } from '@pihub/components/breadcrumbs';
import { BulkAction, ColumnDirective, DataGridComponent, EmptyStateDirective } from '@pihub/components/data-grid';
import { CtaAction } from '@pihub/components/data-grid/data-grid.component';
import { IconComponent } from '@pihub/components/icon';
import { chevronDown, download, pen, plus, trashcan, upload } from '@pihub/components/icons/regular';
import { file, filePdf, fileTxt, fileWord, folder, hamburgerDots, house } from '@pihub/components/icons/solid';
import { TreeComponent, TreeNodeDirective, TreeRoot } from '@pihub/components/tree';
import { DirectoryService, FilesService, GetDirectoryMetadataResponse } from 'generated';
import { distinctUntilChanged, filter, firstValueFrom, map, switchMap } from 'rxjs';
import { DatePipe } from 'src/app/features/explorer/pipes/date.pipe';
import { MimeTypePipe } from 'src/app/features/explorer/pipes/mime-type.pipe';
import { SizePipe } from 'src/app/features/explorer/pipes/size.pipe';
import { ExplorerService } from 'src/app/features/explorer/services/explorer.service';

/**
 * The threshold in milliseconds for a double click.
 */
const DBL_CLICK_THRESHOLD = 300;

@Component({
	selector: 'pihub-explorer',
	templateUrl: './explorer.component.html',
	styleUrl: './explorer.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		DataGridComponent,
		ColumnDirective,
		IconComponent,
		DatePipe,
		MimeTypePipe,
		EmptyStateDirective,
		SizePipe,
		BreadcrumbsComponent,
		TreeComponent,
		TreeNodeDirective,
		NgTemplateOutlet,
		RouterOutlet,
		AsyncPipe,
	],
})
export default class ExplorerComponent {
	/**
	 * The backend service for files.
	 */
	private readonly filesService = inject(FilesService);

	/**
	 * The backend service for directories.
	 */
	private readonly directoryService = inject(DirectoryService);

	/**
	 * The explorer service that holds the state of the explorer.
	 */
	protected readonly explorerService = inject(ExplorerService);

	/**
	 * The activated route that leads to this component.
	 */
	private readonly route = inject(ActivatedRoute);

	/**
	 * The router.
	 */
	private readonly router = inject(Router);

	/**
	 * The root directory of the current user.
	 */
	private readonly root = toSignal(this.directoryService.getRoot(), { initialValue: null });

	/**
	 * The observable that holds the id of the current directory.
	 */
	protected readonly directoryId$ = this.route.paramMap.pipe(
		map((paramMap) => paramMap.get('directoryId')),
		filter((id) => id !== null),
		distinctUntilChanged(),
		takeUntilDestroyed()
	);

	/**
	 * The metadata of the current directory.
	 */
	private readonly metadata = toSignal(
		this.directoryId$.pipe(
			switchMap((id) => this.directoryService.getDirectoryMetadata(id)),
			takeUntilDestroyed()
		),
		{ initialValue: null }
	);

	/**
	 * The nodes of the tree.
	 */
	protected readonly treeNodes = computed(() =>
		this.explorerService.tree().map((node) => ({ ...node, parentId: node.parentId === this.root()?.id ? TreeRoot : node.parentId }))
	);

	/**
	 * The columns of the data grid.
	 * This defines the order of the columns.
	 */
	protected readonly columns = signal<Array<string>>(['Name', 'Typ', 'Größe', 'Geändert am', 'Aktionen']);

	/**
	 * The breadcrumbs that are shown in the header.
	 */
	protected readonly crumbs = computed(() => {
		const metadata = this.metadata();

		return metadata ? this.mapDirectoryMetadataToBreadcrumbs(metadata) : [];
	});

	/**
	 * The signal that holds the selected ids of the data grid.
	 */
	protected readonly selectedIds = signal<Array<string>>([]);

	/**
	 * The icons that are used in the template.
	 */
	protected readonly icons = { folder, file, fileTxt, fileWord, filePdf, house, chevronDown, download, pen, trashcan, hamburgerDots };

	/**
	 * The bulk actions for the data grid.
	 */
	protected readonly bulkActions: Array<BulkAction> = [
		{ icon: download, type: 'default', callback: this.bulkDownload.bind(this) },
		{ icon: trashcan, type: 'danger', callback: this.bulkDelete.bind(this) },
	];

	/**
	 * The CTA actions for the data grid.
	 */
	protected readonly ctaActions: Array<CtaAction> = [
		{ icon: upload, callback: this.uploadFile.bind(this) },
		{ icon: plus, callback: this.createDirectory.bind(this) },
	];

	/**
	 * The id of the last clicked item.
	 */
	private lastClickedId: string | null = null;

	/**
	 * The timestamp of the last click.
	 */
	private lastClickedTimestamp: number = 0;

	public constructor() {
		this.directoryId$.subscribe((id) => this.explorerService.directoryId.set(id));
	}

	/**
	 * Handles the change of the expanded ids of the tree.
	 *
	 * @param expandedIds the new expanded ids
	 */
	protected onTreeNodeExpandedIdsChange(expandedIds: Array<string>): void {
		this.explorerService.expandedIds.set(expandedIds);
	}

	/**
	 * Handles the click event on the arrow of a directory tree node.
	 * Clicking on the arrow will expand or collapse the directory.
	 *
	 * @param id the id of the tree node
	 */
	protected async onTreeNodeArrowClick(id: string, event: MouseEvent): Promise<void> {
		event.stopPropagation();

		const expandedIds = this.explorerService.expandedIds();
		const isExpanded = expandedIds.includes(id);
		const newExpandedIds = isExpanded ? expandedIds.filter((i) => i !== id) : [...expandedIds, id];

		if (!isExpanded) {
			this.explorerService.loadTreeDirectory(id);
		}

		this.explorerService.expandedIds.set(newExpandedIds);
	}

	/**
	 * Handles the click event on a crumb.
	 * This navigates to the directory of the crumb.
	 *
	 * @param id the id of the crumb
	 */
	protected onCrumbClick(id: string): void {
		this.navigateToDirectory(id);
	}

	/**
	 * Renames a file or directory.
	 *
	 * @param id the id of the item to rename
	 * @param event the click event
	 */
	protected async rename(id: string, event: MouseEvent): Promise<void> {
		event.stopPropagation();

		const { name, isDirectory } = this.explorerService.contents().find((row) => row.id === id) ?? {};

		if (!name) {
			return;
		}

		const newName = prompt('Name', name);

		if (!newName || newName === name) {
			return;
		}

		if (isDirectory) {
			await this.explorerService.renameDirectory(id, newName);
		} else {
			await this.explorerService.renameFile(id, newName);
		}
	}

	/**
	 * Downloads a file or directory.
	 *
	 * @param id the id of the item to download
	 * @param event the click event
	 */
	protected async download(id: string, event?: MouseEvent): Promise<void> {
		event?.stopPropagation();

		const item = this.explorerService.contents().find((row) => row.id === id);

		if (!item) {
			return;
		}

		const blob$ = item.isDirectory ? this.directoryService.downloadDirectory(id) : this.filesService.downloadFile(id);

		const link = document.createElement('a');

		link.href = URL.createObjectURL(await firstValueFrom(blob$));
		link.download = item.name;

		link.click();
	}

	/**
	 * Deletes a file or directory.
	 *
	 * @param id the id of the item to delete
	 * @param event the click event
	 */
	protected async delete(id: string, event?: MouseEvent): Promise<void> {
		event?.stopPropagation();

		const confirmation = confirm('Bist du dir sicher, dass du das ELement löschen möchtest?');

		if (!confirmation) {
			return;
		}

		if (this.explorerService.contents().find((row) => row.id === id)?.isDirectory) {
			this.explorerService.deleteDirectory(id);
		} else {
			this.explorerService.deleteFile(id);
		}
	}

	/**
	 * Handles the click event on a row.
	 * We add the selected row to the selection and if the clicked item is a
	 * directory and a double click happend then we navigate to the directory.
	 *
	 * @param id the id of the row
	 */
	protected async onRowClick(id: string): Promise<void> {
		const time = Date.now();

		if (this.explorerService.contents().find((row) => row.id === id)?.isDirectory) {
			if (this.lastClickedId === id && time - this.lastClickedTimestamp < DBL_CLICK_THRESHOLD) {
				this.navigateToDirectory(id);
				return;
			}

			this.lastClickedId = id;
			this.lastClickedTimestamp = time;
		}

		this.selectedIds.update((selectedIds) =>
			selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]
		);
	}

	/**
	 * Handles the change of the selected id of the tree.
	 *
	 * @param id the new selected id
	 */
	protected async onTreeNodeSelectedIdChange(id: string | null): Promise<void> {
		if (!id) {
			return;
		}

		this.navigateToDirectory(id);
	}

	/**
	 * Maps the directory metadata to breadcrumbs.
	 *
	 * @param metadata the directory metadata
	 * @returns the breadcrumbs
	 */
	private mapDirectoryMetadataToBreadcrumbs(metadata: GetDirectoryMetadataResponse): Array<Breadcrumb> {
		const names = metadata.path.split('/');

		return metadata.idChain.map((id, index) => ({
			id: id,
			name: names[index],
		}));
	}

	/**
	 * Navigates to a directory.
	 *
	 * @param directoryId the id of the directory
	 */
	private async navigateToDirectory(directoryId: string): Promise<void> {
		this.selectedIds.set([]);
		this.router.navigate(['..', directoryId], { relativeTo: this.route });
	}

	/**
	 * Deletes all selected files or directories.
	 */
	private async bulkDelete(): Promise<void> {
		const confirmation = confirm('Bist du dir sicher, dass du das die ausgewählten Elemente löschen möchtest?');

		if (!confirmation) {
			return;
		}

		for (const id of this.selectedIds()) {
			if (this.explorerService.contents().find((row) => row.id === id)?.isDirectory) {
				await this.explorerService.deleteDirectory(id);
			} else {
				await this.explorerService.deleteFile(id);
			}
		}

		this.selectedIds.set([]);
	}

	/**
	 * Downloads all selected files or directories.
	 */
	private async bulkDownload(): Promise<void> {
		for (const id of this.selectedIds()) {
			await this.download(id);
		}

		this.selectedIds.set([]);
	}

	/**
	 * Uploads a file.
	 */
	private uploadFile(): void {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('multiple', '');

		input.addEventListener('change', async () => {
			const files = input.files;

			if (!files) {
				return;
			}

			for (const file of files) {
				try {
					await this.explorerService.uploadFile(file);
				} catch (error) {}
			}
		});

		input.click();
	}

	/**
	 * Creates a new directory and updates the view.
	 */
	private async createDirectory(): Promise<void> {
		const name = prompt('Name');

		if (!name) {
			return;
		}

		await this.explorerService.createDirectory(name);
	}
}
