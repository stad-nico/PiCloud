import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { DirectoryContentDirectory, DirectoryContentFile } from 'generated';
import { DirectoryListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/directory-list-item/directory-list-item.component';
import { FileListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/file-list-item/file-list-item.component';
import { SelectableListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-list-item/selectable-list-item.component';
import { ISelectable } from 'src/app/shared/models/ISelectable';
import { SelectEvent } from 'src/app/shared/models/SelectedEvent';

export enum Type {
	Directory,
	File,
}

export type Directory = DirectoryContentDirectory & {
	type: Type.Directory;
};

export type File = DirectoryContentFile & {
	type: Type.File;
};

export type ContentType = File | Directory;

@Component({
	selector: 'pure-content-list',
	standalone: true,
	templateUrl: './pure-content-list.component.html',
	styleUrl: './pure-content-list.component.css',
	imports: [FileListItemComponent, DirectoryListItemComponent, SelectableListItemComponent],
})
export class PureContentListComponent {
	private ref: ElementRef;

	private selected: Array<ISelectable> = [];

	public isInSelectMode: boolean = false;

	@Input()
	public content: Array<ContentType> = [];

	constructor(ref: ElementRef) {
		this.ref = ref;
	}

	@HostListener('document:click', ['$event'])
	public clickOut(event: Event) {
		if (!this.ref.nativeElement.contains(event.target)) {
			this.selected = [];
			this.isInSelectMode = false;
		}
	}

	public onClick(event: SelectEvent) {
		if (!event.selected) {
			event.component!.unselect();

			const index = this.selected.indexOf(event.component!);

			if (index > -1) {
				this.selected.splice(index, 1);
			}

			if (this.selected.length === 0) {
				this.isInSelectMode = false;
			}

			return;
		}

		this.isInSelectMode = true;

		if (!event.ctrl && !event.shift) {
			event.component!.select();

			this.selected.push(event.component!);
		}
	}

	public isFile(content: ContentType): content is File {
		return content.type === Type.File;
	}
}
