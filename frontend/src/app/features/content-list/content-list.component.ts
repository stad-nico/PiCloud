import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDirectoryInfo, ExplorerService } from 'src/app/core/components/explorer/explorer.service';
import { Directory, File, ROOT_ID, Tree, Type } from 'src/app/core/components/explorer/state/explorer.state';
import { PureContentListComponent } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListService } from 'src/app/features/content-list/content-list.service';
import { CheckboxCheckEvent, CheckboxUncheckEvent } from 'src/app/shared/components/checkbox/checkbox.component';

export type ListItemSelectEvent = CheckboxCheckEvent & {
	id: string;
};

export type ListItemUnselectEvent = CheckboxUncheckEvent & {
	id: string;
};

export type ListItemOpenEvent = {
	id: string;
	type: Type;
	name?: string;
};

export type ListItemDeleteEvent = {
	id: string;
};

export type ListItemDownloadEvent = {
	id: string;
	name: string;
	type: Type;
};

@Component({
	selector: 'content-list',
	standalone: true,
	templateUrl: './content-list.component.html',
	styleUrl: './content-list.component.css',
	imports: [PureContentListComponent],
})
export class ContentListComponent {
	private readonly service: ContentListService;

	private readonly explorerService: ExplorerService;

	private readonly tree$: Observable<Tree>;

	private readonly directoryId$: Observable<string>;

	private readonly showCreateDirectoryInfo$: Observable<CreateDirectoryInfo>;

	private readonly selectedIds$: Observable<Array<string>>;

	public isInSelectMode: boolean = false;

	public showCreateDirectoryComponent: boolean = false;

	public isRootOpened: boolean = false;

	public content: Array<File | Directory> = [];

	public directoryId: string = ROOT_ID;

	public selectedIds: Array<string> = [];

	public tree: Tree = {};

	constructor(service: ContentListService, explorerService: ExplorerService) {
		this.service = service;
		this.explorerService = explorerService;

		this.directoryId$ = explorerService.getDirectory();
		this.showCreateDirectoryInfo$ = explorerService.getCreateDirectoryInfo();
		this.tree$ = explorerService.getTree();
		this.selectedIds$ = service.getSelectedIds();
	}

	ngOnInit() {
		this.showCreateDirectoryInfo$.subscribe((info) => (this.showCreateDirectoryComponent = info.showCreateDirectoryComponent && !info.isRoot));

		this.directoryId$.subscribe((id) => {
			this.directoryId = id;
			this.content = this.tree[this.directoryId] ?? [];
			// this.service.fetchContent(id);
			this.isRootOpened = id === ROOT_ID;
		});

		this.tree$.subscribe((tree) => {
			this.content = tree[this.directoryId] ?? [];
			this.tree = tree;
		});

		this.selectedIds$.subscribe((ids) => {
			this.selectedIds = ids;
			this.isInSelectMode = this.selectedIds.length > 0;
		});
	}

	onSelect(event: ListItemSelectEvent) {
		this.service.select(event);
	}

	onUnselect(event: ListItemUnselectEvent) {
		this.service.unselect(event);
	}

	onOpen(event: ListItemOpenEvent) {
		this.explorerService.open(event.id, event.type, event.name);
	}

	selectAll() {
		this.service.selectAll();
	}

	unselectAll() {
		this.service.unselectAll();
	}

	onDeleteSelected() {
		const confirmation = confirm(`Sicher, dass du die ausgewählten Elemente löschen willst?`);

		if (confirmation) {
			this.service.deleteSelected();
		}
	}

	onPlusClick() {
		this.explorerService.showCreateDirectoryComponent();
	}

	onCancelCreation() {
		this.explorerService.hideCreateDirectoryComponent();
	}

	onUploadClick() {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('multiple', '');

		input.addEventListener('change', () => {
			const files = input.files;

			if (!files) {
				return;
			}

			for (const file of files) {
				this.explorerService.uploadFile(file);
			}
		});

		input.click();
	}

	onCreate(name: string) {
		this.explorerService.createDirectory(name);
	}

	onDelete(event: ListItemDeleteEvent) {
		const confirmation = confirm(`Sicher, dass du ${this.content.find((x) => x.id === event.id)?.name} löschen willst?`);

		if (confirmation) {
			if (this.content.find((x) => x.id === event.id)?.type === Type.Directory) {
				this.explorerService.deleteDirectory(event.id);
			} else {
				this.explorerService.deleteFile(event.id);
			}
		}
	}

	onDownload(event: ListItemDownloadEvent) {
		if (event.type === Type.Directory) {
			this.service.downloadDirectory(event.id, event.name);
		} else {
			this.service.downloadFile(event.id, event.name);
		}
	}
}
