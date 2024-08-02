import { Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
	ListItemSelectEvent,
	ListItemUnselectEvent,
} from 'src/app/features/content-list/components/pure-content-list/components/selectable-directory-list-item/selectable-directory-list-item.component';
import { ContentType, PureContentListComponent } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { ContentListService } from 'src/app/features/content-list/content-list.service';

@Component({
	selector: 'content-list',
	standalone: true,
	templateUrl: './content-list.component.html',
	styleUrl: './content-list.component.css',
	imports: [PureContentListComponent],
})
export class ContentListComponent {
	private readonly service: ContentListService;

	private readonly content$: Observable<Array<ContentType>>;

	private readonly isInSelectMode$: Observable<boolean>;

	private readonly subscriptions: Subscription = new Subscription();

	public isInSelectMode: boolean = false;

	public content: Array<ContentType> = [];

	constructor(service: ContentListService) {
		this.service = service;

		this.content$ = service.getContent();
		this.isInSelectMode$ = service.isAtLeastOneSelected();
	}

	ngOnInit() {
		this.subscriptions.add(
			this.content$.subscribe((content) => {
				this.content = content;
			})
		);

		this.subscriptions.add(
			this.isInSelectMode$.subscribe((isInSelectMode) => {
				this.isInSelectMode = isInSelectMode;
			})
		);
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe();
	}

	onSelect(event: ListItemSelectEvent) {
		this.service.select(event);
	}

	onUnselect(event: ListItemUnselectEvent) {
		this.service.unselect(event);
	}

	selectAll() {
		this.service.selectAll();
	}

	unselectAll() {
		this.service.unselectAll();
	}
}
