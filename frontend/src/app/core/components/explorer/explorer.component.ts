import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExplorerService } from 'src/app/core/components/explorer/explorer.service';
import { BreadcrumbsComponent } from 'src/app/features/breadcrumbs/breadcrumbs.component';
import { ContentListComponent } from 'src/app/features/content-list/content-list.component';
import { DirectoryTreeComponent } from 'src/app/features/directory-tree/directory-tree.component';

@Component({
	standalone: true,
	selector: 'explorer',
	templateUrl: './explorer.component.html',
	styleUrl: './explorer.component.css',
	imports: [DirectoryTreeComponent, ContentListComponent, BreadcrumbsComponent],
})
export class ExplorerComponent {
	private readonly service: ExplorerService;

	private readonly route: ActivatedRoute;

	public constructor(route: ActivatedRoute, service: ExplorerService) {
		this.route = route;
		this.service = service;
	}

	ngOnInit() {
		const directoryId = this.route.snapshot.paramMap.get("directoryId");

		if (!directoryId) {
			throw new Error("No directory id")
		}

		this.service.open(directoryId);
	}
}
