import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { DirectoryContentDirectory, DirectoryContentFile } from 'generated';
import { SelectableFileListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-file-list-item/selectable-file-list-item.component';
import {
	ListItemOpenEvent,
	ListItemSelectEvent,
	ListItemUnselectEvent,
	SelectableDirectoryListItemComponent,
} from './components/selectable-directory-list-item/selectable-directory-list-item.component';

export enum Type {
	Directory,
	File,
}

export type Directory = DirectoryContentDirectory & {
	type: Type.Directory;
	id: number;
	isSelected: boolean;
};

export type File = DirectoryContentFile & {
	type: Type.File;
	id: number;
	isSelected: boolean;
};

export type ContentType = File | Directory;

@Component({
	selector: 'pure-content-list',
	standalone: true,
	templateUrl: './pure-content-list.component.html',
	styleUrl: './pure-content-list.component.css',
	imports: [SelectableDirectoryListItemComponent, SelectableFileListItemComponent],
})
export class PureContentListComponent {
	private ref: ElementRef;

	@HostBinding('class.in-select-mode')
	@Input({ alias: 'isInSelectMode', required: true })
	public isInSelectMode!: boolean;

	@Input({ required: true })
	public content!: Array<ContentType>;

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

	constructor(ref: ElementRef) {
		this.ref = ref;
	}

	@HostListener('document:click', ['$event'])
	public clickOut(event: Event) {
		if (!this.ref.nativeElement.contains(event.target)) {
			this.onClickOutside.emit();
		}
	}

	public isFile(content: ContentType): content is File {
		return content.type === Type.File;
	}
}
