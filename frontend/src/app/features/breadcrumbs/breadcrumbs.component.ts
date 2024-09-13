import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, skip } from 'rxjs';
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
	private readonly service: BreadcrumbsService;

	private readonly explorerService: ExplorerService;

	private readonly crumbs$: Observable<Array<Crumb>>;

	private readonly directoryId$: Observable<string>;

	public crumbs: Array<Crumb> = [];

	public constructor(service: BreadcrumbsService, explorerService: ExplorerService) {
		this.service = service;
		this.explorerService = explorerService;

		this.crumbs$ = service.getCrumbs();
		this.directoryId$ = explorerService.getDirectory();
	}

	public ngOnInit() {
		this.crumbs$.subscribe((crumbs) => (this.crumbs = crumbs));

		this.directoryId$.pipe(skip(1)).subscribe((directoryId) => this.service.buildCrumbs(directoryId));
	}

	public onClick(crumb: Crumb) {
		this.explorerService.open(crumb.id);
	}
}
