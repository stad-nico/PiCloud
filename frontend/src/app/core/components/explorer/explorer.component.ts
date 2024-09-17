import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, skip, take } from 'rxjs';
import { ExplorerService } from 'src/app/core/components/explorer/explorer.service';
import { Type } from 'src/app/core/components/explorer/state/explorer.state';
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
		const directoryId$ = this.route.paramMap.pipe(
			map((params) => {
				const id = params.get('directoryId');

				if (!id) {
					throw new Error('ID not defined');
				}

				return id;
			})
		);

		directoryId$.pipe(take(1)).subscribe((id) => {
			this.service.open(id, Type.Directory);
			this.service.loadInitialContent(id);
		});

		directoryId$.pipe(skip(1)).subscribe((id) => {
			this.service.open(id, Type.Directory);
		});
	}
}
