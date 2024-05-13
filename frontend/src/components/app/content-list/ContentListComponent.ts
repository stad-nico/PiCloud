import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

type Item = {
	name: string;
};

interface File {
	name: string;
	type: 'FILE';
	size: number;
	mimeType: string;
	createdAt: Date;
	updatedAt: Date;
}

interface Directory {
	id: string;
	name: string;
	size: number;
	createdAt: Date;
	updatedAt: Date;
	type: 'DIRECTORY';
}

const File = 'FILE';
const Directory = 'DIRECTORY';

@Component({
	selector: 'content-list',
	standalone: true,
	templateUrl: './ContentListComponent.html',
	imports: [HttpClientModule],
})
export class ContentListComponent {
	items: (File | Directory)[] = [];

	constructor(private http: HttpClient, private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.params.subscribe((params) => {
			this.fetchItems(params['path'] ?? 'root');
		});
	}

	private fetchItems(path: string) {
		this.http.get<{ files: any[]; directories: any[] }>(`/api/directory/${path}/content`).subscribe({
			next: (value) => {
				console.log(value);
				this.items = [
					...value.files.map((x) => ({
						...x,
						type: File,
						createdAt: new Date(Date.parse(x.createdAt)),
						updatedAt: new Date(Date.parse(x.updatedAt)),
					})),
					...value.directories.map((x) => ({
						...x,
						type: Directory,
						createdAt: new Date(Date.parse(x.createdAt)),
						updatedAt: new Date(Date.parse(x.updatedAt)),
					})),
				];
				console.log(this.items);
			},
			error: (error) => {
				console.log(error);
			},
			complete: () => {
				console.log('complete');
			},
		});
	}
}
