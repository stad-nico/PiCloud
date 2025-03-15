import { effect, inject, Injectable, signal } from '@angular/core';
import { DirectoryService, FilesService } from 'generated';
import { firstValueFrom } from 'rxjs';
import { ExplorerContentService } from 'src/app/features/explorer/services/explorer-content.service';
import { ExplorerTreeService } from 'src/app/features/explorer/services/explorer-tree.service';

@Injectable({ providedIn: 'root' })
export class ExplorerService {
	private readonly directoryService = inject(DirectoryService);

	private readonly fileService = inject(FilesService);

	private readonly contentService = inject(ExplorerContentService);

	private readonly treeService = inject(ExplorerTreeService);

	public readonly directoryId = signal<string | null>(null);

	public readonly tree = this.treeService.tree;

	public readonly contents = this.contentService.contents;

	public readonly expandedIds = this.treeService.expandedIds;

	public constructor() {
		effect(() => {
			this.contentService.directoryId.set(this.directoryId());
			this.treeService.directoryId.set(this.directoryId());
		});
	}

	public async renameFile(fileId: string, name: string): Promise<void> {
		await firstValueFrom(this.fileService.renameFile(fileId, { name }));

		this.contentService.softReload();
	}

	public async renameDirectory(directoryId: string, name: string): Promise<void> {
		await firstValueFrom(this.directoryService.renameDirectory(directoryId, { name }));

		this.contentService.softReload();
		this.treeService.reload(this.directoryId()!);
	}

	public async deleteFile(fileId: string): Promise<void> {
		await firstValueFrom(this.fileService.deleteFile(fileId));

		this.contentService.softReload();
	}

	public async deleteDirectory(directoryId: string): Promise<void> {
		await firstValueFrom(this.directoryService.deleteDirectory(directoryId));

		if (this.contents().some((c) => c.id === directoryId)) {
			this.contentService.softReload();
		}

		this.treeService.reload(this.directoryId()!);
	}

	public async createDirectory(name: string, parentId?: string): Promise<void> {
		const parentDirectory = parentId ?? this.directoryId();

		if (!parentDirectory) {
			return;
		}

		await firstValueFrom(this.directoryService.createDirectory(parentDirectory, { name }));

		if (parentDirectory === this.directoryId()) {
			this.contentService.softReload();
		}

		this.treeService.reload(parentDirectory);

		return;
	}

	public async uploadFile(file: File, directoryId?: string): Promise<void> {
		const directory = directoryId ?? this.directoryId();

		if (!directory) {
			return;
		}

		await firstValueFrom(this.fileService.uploadFile(directory, file));

		if (directory === this.directoryId()) {
			this.contentService.softReload();
		}
	}

	public loadTreeDirectory(directoryId: string): void {
		this.treeService.loadDirectory(directoryId);
	}
}
