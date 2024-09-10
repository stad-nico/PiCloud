import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDirectoryInfo, ExplorerService } from 'src/app/core/components/explorer/explorer.service';
import { ROOT_ID } from 'src/app/core/components/explorer/state/explorer.state';
import {
	ListItemDeleteEvent,
	ListItemOpenEvent,
	ListItemSelectEvent,
	ListItemUnselectEvent,
} from 'src/app/features/content-list/components/pure-content-list/components/selectable-directory-list-item/selectable-directory-list-item.component';
import { ContentType, PureContentListComponent } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListService } from 'src/app/features/content-list/content-list.service';

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

	private readonly content$: Observable<Array<ContentType>>;

	private readonly isInSelectMode$: Observable<boolean>;

	private readonly directoryId$: Observable<string>;

	private readonly showCreateDirectoryInfo$: Observable<CreateDirectoryInfo>;

	private readonly isLoading$: Observable<boolean>;

	public isInSelectMode: boolean = false;

	public showCreateDirectoryComponent: boolean = false;

	public isRootOpened: boolean = false;

	public content: Array<ContentType> = [];

	public isLoading: boolean = false;

	constructor(service: ContentListService, explorerService: ExplorerService) {
		this.service = service;
		this.explorerService = explorerService;

		this.content$ = service.selectContent();
		this.isInSelectMode$ = service.isAtLeastOneSelected();
		this.isLoading$ = service.selectIsLoading();
		this.directoryId$ = explorerService.getDirectory();
		this.showCreateDirectoryInfo$ = explorerService.getCreateDirectoryInfo();
	}

	ngOnInit() {
		this.showCreateDirectoryInfo$.subscribe((info) => (this.showCreateDirectoryComponent = info.showCreateDirectoryComponent && !info.isRoot));

		this.directoryId$.subscribe((id) => {
			this.service.fetchContent(id);
			this.isRootOpened = id === ROOT_ID;
		});

		this.content$.subscribe((content) => (this.content = content));

		this.isInSelectMode$.subscribe((isInSelectMode) => (this.isInSelectMode = isInSelectMode));

		this.isLoading$.subscribe((isLoading) => (this.isLoading = isLoading));
	}

	onSelect(event: ListItemSelectEvent) {
		this.service.select(event);
	}

	onUnselect(event: ListItemUnselectEvent) {
		this.service.unselect(event);
	}

	onOpen(event: ListItemOpenEvent) {
		this.explorerService.open(event.id);
	}

	selectAll() {
		this.service.selectAll();
	}

	unselectAll() {
		this.service.unselectAll();
	}

	onDelete(event: ListItemDeleteEvent) {
		const confirmation = confirm(`Sicher, dass du ${this.content.find((x) => x.id === event.id)?.name} löschen willst?`);

		if (confirmation) {
			// this.service.delete(event);
		}
	}

	onDeleteSelected() {
		const confirmation = confirm(`Sicher, dass du die ausgewählten Elemente löschen willst?`);

		if (confirmation) {
			// this.service.deleteSelected();
		}
	}

	onPlusClick() {
		this.explorerService.showCreateDirectoryComponent();
	}

	onCreate(name: string) {
		this.explorerService.createDirectory(name);
	}

	onCancelCreation() {
		this.explorerService.hideCreateDirectoryComponent();
	}
}
