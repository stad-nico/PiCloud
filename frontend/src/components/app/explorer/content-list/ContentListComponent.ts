import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BASE_PATH, DirectoryContentDirectory, DirectoryContentFile, DirectoryService } from 'generated';
import { ContentListDirectoryComponent } from 'src/components/app/explorer/content-list/content-list-directory/ContentListDirectoryComponent';
import { ContentListFileComponent } from 'src/components/app/explorer/content-list/content-list-file/ContentListFileComponent';

@Component({
	selector: 'content-list',
	standalone: true,
	templateUrl: './ContentListComponent.html',
	providers: [{ provide: BASE_PATH, useValue: '/api' }, DirectoryService],
	imports: [ContentListDirectoryComponent, ContentListFileComponent],
})
export class ContentListComponent {
	private readonly directoryService: DirectoryService;

	private readonly route: ActivatedRoute;

	files: DirectoryContentFile[] = [];

	directories: DirectoryContentDirectory[] = [];

	constructor(@Inject(DirectoryService) directoryService: DirectoryService, route: ActivatedRoute) {
		this.directoryService = directoryService;
		this.route = route;
	}

	ngOnInit() {
		this.route.url.subscribe((segments) => {
			const path = segments.map((x) => x.path).join('/');
			this.fetchItems(path);
		});
	}

	private fetchItems(path: string) {
		this.directoryService.getDirectoryContent(path).subscribe({
			next: (value: any) => {
				this.files = value.files;
				this.directories = value.directories;
			},
			error: (error: any) => {
				console.log(error);
			},
		});
	}
}
