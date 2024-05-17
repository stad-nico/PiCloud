import { Component, Input } from '@angular/core';
import { DirectoryContentDirectory, DirectoryService } from 'generated';

@Component({
	selector: 'tree-view-directory',
	standalone: true,
	templateUrl: './TreeViewDirectoryComponent.html',
	styleUrl: './TreeViewDirectoryComponent.css',
})
export class TreeViewDirectoryComponent {
	private readonly directoryService: DirectoryService;

	constructor(directoryService: DirectoryService) {
		this.directoryService = directoryService;
	}

	@Input({ required: true })
	path!: string;

	@Input({ required: true })
	name!: string;

	isCollapsed: boolean = true;

	children: DirectoryContentDirectory[] = [];

	isLoaded: boolean = false;

	toggle() {
		this.isCollapsed = !this.isCollapsed;

		if (!this.isLoaded) {
			this.directoryService.getDirectoryContent(this.path).subscribe({
				next: (value) => {
					this.children = value.directories;
				},
			});

			this.isLoaded = true;
		}
	}
}
