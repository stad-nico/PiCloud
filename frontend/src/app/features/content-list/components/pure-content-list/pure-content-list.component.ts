import { Component, ElementRef, HostListener, Input, QueryList, ViewChildren } from '@angular/core';
import { DirectoryContentDirectory, DirectoryContentFile } from 'generated';
import { DirectoryListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/directory-list-item/directory-list-item.component';
import { FileListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/file-list-item/file-list-item.component';
import { SelectableListItemComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-list-item/selectable-list-item.component';
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

	private selected: Set<number> = new Set();

	public isInSelectMode: boolean = false;

	private lastSelectedId!: number;

	@ViewChildren(SelectableListItemComponent)
	private children!: QueryList<SelectableListItemComponent>;

	@Input()
	public content: Array<ContentType> = [];

	constructor(ref: ElementRef) {
		this.ref = ref;
	}

	@HostListener('document:click', ['$event'])
	public clickOut(event: Event) {
		if (!this.ref.nativeElement.contains(event.target)) {
			this.selected.clear();
			this.isInSelectMode = false;
		}
	}

	public onClick(event: SelectEvent) {
		const component: SelectableListItemComponent | undefined = this.children.get(event.id!);

		if (!component) {
			return;
		}

		if (!event.selected && !event.ctrl && !event.shift) {
			component.unselect();

			this.selected.delete(component.id);

			if (this.selected.size === 0) {
				this.isInSelectMode = false;
			}

			return;
		}

		if (!event.selected && (event.ctrl || event.shift)) {
			const start = Math.min(this.lastSelectedId, component.id);
			const range = Math.abs(this.lastSelectedId - component.id) + 1;

			this.unselectRange(start, start + range);

			return;
		}

		this.isInSelectMode = true;

		if (event.ctrl || event.shift) {
			const start = Math.min(this.lastSelectedId, component.id);
			const range = Math.abs(this.lastSelectedId - component.id) + 1;

			this.selectRange(start, start + range);
		}

		if (!event.ctrl && !event.shift) {
			this.lastSelectedId = component.id;
			component.select();

			this.selected.add(component.id);
		}
	}

	//! Remove unselectRange and selectRange and replace with dynamicRange:
	// IF one in range is not selected, select all
	// IF all in range are selected, unselect all

	public selectRange(start: number, end: number) {
		for (let i = start; i < end; i++) {
			const child = this.children.get(i);

			if (!child) {
				continue;
			}

			child.select();
			this.selected.add(child.id);
		}

		this.lastSelectedId = end;
	}

	public unselectRange(start: number, end: number) {
		for (let i = start; i < end; i++) {
			const child = this.children.get(i);

			if (!child) {
				continue;
			}

			child.unselect();
			this.selected.delete(child.id);
		}

		this.lastSelectedId = end;
	}

	public isFile(content: ContentType): content is File {
		return content.type === Type.File;
	}
}
