import { Component, EventEmitter, Input, Output } from '@angular/core';

export type Crumb = {
	id: string;
	name: string;
};

@Component({
	standalone: true,
	selector: 'pure-breadcrumbs',
	styleUrl: './pure-breadcrumbs.component.css',
	templateUrl: './pure-breadcrumbs.component.html',
})
export class PureBreadcrumbsComponent {
	@Input()
	public crumbs: Array<Crumb> = [];

	@Output()
	public onClick: EventEmitter<Crumb> = new EventEmitter();
}
