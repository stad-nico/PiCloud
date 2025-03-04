import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Directory, File, Type } from 'src/app/core/components/explorer/state/explorer.state';
import { SelectableListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-list-item/selectable-list-item.component';
import {
	ListItemDeleteEvent,
	ListItemDownloadEvent,
	ListItemOpenEvent,
	ListItemSelectEvent,
	ListItemUnselectEvent,
} from 'src/app/features/content-list/content-list.component';
import { Direction, ExpandingMenuButtonComponent } from 'src/app/shared/components/expanding-menu-button/expanding-menu-button.component';
import { LoadingSpinnerComponent } from 'src/app/shared/components/loading-spinner/loading-spinner.component';
import { NameableDirectoryItemComponent } from 'src/app/shared/components/nameable-directory-item/nameable-directory-item.component';

@Component({
	selector: 'pure-content-list',
	standalone: true,
	templateUrl: './pure-content-list.component.html',
	styleUrl: './pure-content-list.component.css',
	imports: [SelectableListItemComponent, ExpandingMenuButtonComponent, NameableDirectoryItemComponent, LoadingSpinnerComponent],
	animations: [trigger('imageFadeTrigger', [transition(':enter', [style({ opacity: 0 }), animate('0.3s', style({ opacity: 1 }))])])],
})
export class PureContentListComponent {
	private readonly ref: ElementRef;

	@ViewChild('itemContainer')
	private readonly itemContainerRef!: ElementRef<HTMLDivElement>;

	public readonly expandingMenuButtonDirection = Direction.Up;

	@Input({ alias: 'isInSelectMode', required: true })
	@HostBinding('class.in-select-mode')
	public isInSelectMode!: boolean;

	@Input()
	public content: Array<File | Directory> = [];

	@Input()
	public selectedIds: Array<string> = [];

	@Input()
	@HostBinding('class.is-root-opened')
	public isRootOpened: boolean = false;

	@Input()
	@HostBinding('class.is-loading')
	public isLoading: boolean = false;

	@Input()
	public showCreateDirectoryComponent: boolean = false;

	@Output()
	public onSelect: EventEmitter<ListItemSelectEvent> = new EventEmitter();

	@Output()
	public onUnselect: EventEmitter<ListItemUnselectEvent> = new EventEmitter();

	@Output()
	public onClickOutside: EventEmitter<void> = new EventEmitter();

	@Output()
	public onSelectAll: EventEmitter<void> = new EventEmitter();

	@Output()
	public onUnselectAll: EventEmitter<void> = new EventEmitter();

	@Output()
	public onOpen: EventEmitter<ListItemOpenEvent> = new EventEmitter();

	@Output()
	public onDelete: EventEmitter<ListItemDeleteEvent> = new EventEmitter();

	@Output()
	public onCreate: EventEmitter<string> = new EventEmitter();

	@Output()
	public onPlusClick: EventEmitter<void> = new EventEmitter();

	@Output()
	public onUploadClick: EventEmitter<void> = new EventEmitter();

	@Output()
	public onCancelCreation: EventEmitter<void> = new EventEmitter();

	@Output()
	public onDeleteSelected: EventEmitter<void> = new EventEmitter();

	@Output()
	public onDownload: EventEmitter<ListItemDownloadEvent> = new EventEmitter();

	constructor(ref: ElementRef) {
		this.ref = ref;
	}

	@HostListener('document:click', ['$event'])
	public clickOut(event: Event) {
		if (!this.ref.nativeElement.contains(event.target) || event.target === this.itemContainerRef.nativeElement) {
			this.onClickOutside.emit();
		}
	}

	public isFile(item: File | Directory): item is File {
		return item.type === Type.File;
	}
}
