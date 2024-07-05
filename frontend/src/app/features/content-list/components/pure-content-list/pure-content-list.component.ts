import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { DirectoryContentDirectory, DirectoryContentFile } from 'generated';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { DirectoryListItemComponent } from 'src/app/shared/components/directory-list-item/directory-list-item.component';
import { FileListItemComponent } from 'src/app/shared/components/file-list-item/file-list-item.component';
import { ISelectable } from 'src/app/shared/models/ISelectable';

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
	imports: [FileListItemComponent, DirectoryListItemComponent, CheckboxComponent],
})
export class PureContentListComponent {
	private ref: ElementRef;

	private selected!: ISelectable;

	private isInSelectMode: boolean;

	@Input()
	public content: Array<ContentType> = [];

	constructor(ref: ElementRef) {
		this.ref = ref;
		this.isInSelectMode = false;
	}

	@HostListener('document:click', ['$event'])
	public clickOut(event: Event) {
		if (!this.ref.nativeElement.contains(event.target)) {
			this.selected.unselect();
			this.isInSelectMode = false;
		}
	}

	public onClick(selectable: ISelectable) {
		if (this.selected) {
			this.selected.unselect();
		}

		this.selected = selectable;
		this.selected.select();
	}

	public isFile(content: ContentType): content is File {
		return content.type === Type.File;
	}
}
