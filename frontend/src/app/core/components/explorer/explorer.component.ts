import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
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

	private readonly router: Router;

	private readonly route: ActivatedRoute;

	public constructor(route: ActivatedRoute, router: Router, service: ExplorerService) {
		this.route = route;
		this.router = router;
		this.service = service;
	}

	ngOnInit() {
		this.service.setDirectory(this.route.snapshot.paramMap.get('directoryId')!);
		this.service.loadInitialContent();

		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe(() => this.service.setDirectory(this.route.snapshot.paramMap.get('directoryId')!));
	}
}
