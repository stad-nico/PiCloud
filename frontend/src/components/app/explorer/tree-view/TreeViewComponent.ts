import { Component, Inject } from '@angular/core';
import { BASE_PATH, DirectoryContentDirectory, DirectoryService } from 'generated';
import { TreeViewDirectoryComponent } from 'src/components/app/explorer/tree-view/tree-view-directory/TreeViewDirectoryComponent';

@Component({
	selector: 'tree-view',
	standalone: true,
	templateUrl: './TreeViewComponent.html',
	providers: [{ provide: BASE_PATH, useValue: '/api' }, DirectoryService],
	imports: [TreeViewDirectoryComponent],
	styleUrl: './TreeViewComponent.css',
})
export class TreeViewComponent {
	private readonly directoryService: DirectoryService;

	directories: DirectoryContentDirectory[] = [];

	readonly path = 'root';

	constructor(@Inject(DirectoryService) directoryService: DirectoryService) {
		this.directoryService = directoryService;
	}

	ngOnInit() {
		this.fetchItems(this.path);
	}

	private fetchItems(path: string) {
		this.directoryService.getDirectoryContent(path).subscribe({
			next: (value: any) => {
				console.log(value);
				this.directories = value.directories;
			},
			error: (error: any) => {
				console.log(error);
			},
		});
	}
}
