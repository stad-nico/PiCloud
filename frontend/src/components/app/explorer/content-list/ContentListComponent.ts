import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { DirectoryContentDirectory, DirectoryContentFile } from 'generated';
import { Observable, combineLatest, map } from 'rxjs';
import { ContentListStateName, ContentListStateType, GetContentListContent } from 'src/components/app/actions/content.state';
import { PathState } from 'src/components/app/actions/path';

import { ContentListDirectoryComponent } from 'src/components/app/explorer/content-list/content-list-directory/ContentListDirectoryComponent';
import { ContentListFileComponent } from 'src/components/app/explorer/content-list/content-list-file/ContentListFileComponent';
import { CreateDirectoryComponent } from 'src/components/app/explorer/create-directory-component/CreateDirectoryComponent';
import { LoadingSpinnerComponent } from 'src/components/app/loading-spinner/LoadingSpinnerComponent';

@Component({
	selector: 'content-list',
	standalone: true,
	templateUrl: './ContentListComponent.html',
	styleUrl: './ContentListComponent.css',
	imports: [AsyncPipe, ContentListDirectoryComponent, ContentListFileComponent, LoadingSpinnerComponent, CreateDirectoryComponent],
})
export class ContentListComponent {
	private readonly store: Store;

	@HostBinding('class.loaded')
	loaded: boolean = false;

	@HostBinding('class.empty')
	empty: boolean = false;

	@HostBinding('class.choosing')
	isRootPath: boolean = false;

	@Output()
	loadedEvent = new EventEmitter<void>();

	@Select(PathState.path)
	path$!: Observable<string>;

	@Select((state: ContentListStateType) => state[ContentListStateName].directories)
	directories$!: Observable<DirectoryContentDirectory[]>;

	@Select((state: ContentListStateType) => state[ContentListStateName].files)
	files$!: Observable<DirectoryContentFile[]>;

	displayCreateDirectoryComponent: boolean = false;

	public constructor(store: Store) {
		this.store = store;
	}

	ngOnInit() {
		combineLatest([this.directories$, this.files$])
			.pipe(map(([directories, files]) => ({ directories: directories, files: files })))
			.subscribe((content) => {
				if (content.directories && content.files) {
					this.loaded = true;
					this.loadedEvent.emit();
					this.empty = content.directories.length === 0 && content.files.length === 0;
				}
			});

		this.path$.subscribe((path) => {
			this.isRootPath = path === 'root';
			this.store.dispatch(new GetContentListContent(path));
		});
	}

	displayDirectoryCreateComponent() {
		this.displayCreateDirectoryComponent = true;
	}

	removeDirectoryCreateComponent() {
		this.displayCreateDirectoryComponent = false;
	}
}
