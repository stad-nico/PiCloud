import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ViewChild } from '@angular/core';
import { DirectoryMetadataResponse, FileMetadataResponse } from 'generated';
import { SelectableFileListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-file-list-item/selectable-file-list-item.component';
import { Direction, ExpandingMenuButtonComponent } from 'src/app/shared/components/expanding-menu-button/expanding-menu-button.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { NameableDirectoryItemComponent } from '../../../../shared/components/nameable-directory-item/nameable-directory-item.component';
import {
	ListItemDeleteEvent,
	ListItemOpenEvent,
	ListItemSelectEvent,
	ListItemUnselectEvent,
	SelectableDirectoryListItemComponent,
} from './components/selectable-directory-list-item/selectable-directory-list-item.component';

export enum Type {
	Directory,
	File,
}

export type Directory = DirectoryMetadataResponse & {
	type: Type.Directory;
	id: string;
	isSelected: boolean;
	isBeingProcessed: boolean;
};

export type File = FileMetadataResponse & {
	type: Type.File;
	id: string;
	isSelected: boolean;
	isBeingProcessed: boolean;
};

export type ContentType = File | Directory;

@Component({
	selector: 'pure-content-list',
	standalone: true,
	templateUrl: './pure-content-list.component.html',
	styleUrl: './pure-content-list.component.css',
	imports: [
		SelectableDirectoryListItemComponent,
		SelectableFileListItemComponent,
		ExpandingMenuButtonComponent,
		NameableDirectoryItemComponent,
		LoadingSpinnerComponent,
	],
})
export class PureContentListComponent {
	private readonly ref: ElementRef;

	@ViewChild('itemContainer')
	private readonly itemContainerRef!: ElementRef<HTMLDivElement>;

	public readonly expandingMenuButtonDirection = Direction.Up;

	@Input({ alias: 'isInSelectMode', required: true })
	@HostBinding('class.in-select-mode')
	public isInSelectMode!: boolean;

	@Input({ required: true })
	public content!: Array<ContentType>;

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
	public onCancelCreation: EventEmitter<void> = new EventEmitter();

	@Output()
	public onDeleteSelected: EventEmitter<void> = new EventEmitter();

	constructor(ref: ElementRef) {
		this.ref = ref;
	}

	@HostListener('document:click', ['$event'])
	public clickOut(event: Event) {
		if (!this.ref.nativeElement.contains(event.target) || event.target === this.itemContainerRef.nativeElement) {
			this.onClickOutside.emit();
		}
	}

	public isFile(content: ContentType): content is File {
		return content.type === Type.File;
	}
}
