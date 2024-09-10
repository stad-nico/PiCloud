import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ExplorerService } from 'src/app/core/components/explorer/explorer.service';
import { BreadcrumbsService } from 'src/app/features/breadcrumbs/breadcrumbs.service';
import { Crumb, PureBreadcrumbsComponent } from './components/pure-breadcrumbs/pure-breadcrumbs.component';

@Component({
	standalone: true,
	selector: 'breadcrumbs',
	styleUrl: './breadcrumbs.component.css',
	templateUrl: './breadcrumbs.component.html',
	imports: [PureBreadcrumbsComponent, AsyncPipe],
})
export class BreadcrumbsComponent {
	private readonly crumbs$: Observable<Array<Crumb>>;

	private readonly explorerService: ExplorerService;

	public crumbs: Array<Crumb> = [];

	public constructor(service: BreadcrumbsService, explorerService: ExplorerService) {
		this.explorerService = explorerService;

		this.crumbs$ = service.getCrumbs();
	}

	public ngOnInit() {
		this.crumbs$.subscribe((crumbs) => (this.crumbs = crumbs));
	}

	public onClick(crumb: Crumb) {
		this.explorerService.open(crumb.id);
	}
}
