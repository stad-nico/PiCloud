import { Component, ElementRef, HostBinding, HostListener, Input, QueryList, ViewChildren } from '@angular/core';
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

	@HostBinding('class.in-select-mode')
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

	public isFile(content: ContentType): content is File {
		return content.type === Type.File;
	}

	public onClick(event: SelectEvent) {
		const component: SelectableListItemComponent | undefined = this.children.get(event.id!);

		if (!component) {
			return;
		}

		if (this.lastSelectedId === undefined || (!event.ctrl && !event.shift)) {
			this.handleSingleSelect(event.selected, component);
		} else {
			this.handleRangeSelect(event.selected, component);
		}

		this.lastSelectedId = component.id;
	}

	private handleSingleSelect(selected: boolean, component: SelectableListItemComponent) {
		if (selected) {
			component.select();
			this.selected.add(component.id);
		} else {
			component.unselect();
			this.selected.delete(component.id);
		}

		this.isInSelectMode = this.selected.size > 0;
	}

	private handleRangeSelect(selected: boolean, component: SelectableListItemComponent) {
		const start = Math.min(this.lastSelectedId, component.id);
		const end = Math.max(this.lastSelectedId, component.id);

		if ((selected && end - start <= 2) || this.isUnselectedComponentInRange(start, end)) {
			this.selectRange(start, end);
		} else if (selected) {
			this.unselectRange(start, end);
		} else {
			this.unselectRange(start === component.id ? start + 1 : start, end);
			component.select();
			this.selected.add(component.id);
		}
	}

	private selectRange(start: number, end: number) {
		for (let i = start; i <= end; i++) {
			const child = this.children.get(i);

			if (!child) {
				continue;
			}

			child.select();
			this.selected.add(child.id);
		}
	}

	private unselectRange(start: number, end: number) {
		for (let i = start; i <= end; i++) {
			const child = this.children.get(i);

			if (!child) {
				continue;
			}

			child.unselect();
			this.selected.delete(child.id);
		}
	}

	private isUnselectedComponentInRange(start: number, end: number): boolean {
		return this.children.find((c) => c.id >= start && c.id <= end && !c.selected) !== undefined;
	}
}
