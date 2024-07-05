import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ContentType, PureContentListComponent } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';

@Component({
	selector: 'content-list',
	standalone: true,
	templateUrl: './content-list.component.html',
	styleUrl: './content-list.component.css',
	imports: [PureContentListComponent],
})
export class ContentListComponent {
	public content: Array<ContentType> = [];

	private content$: Observable<Array<ContentType>>;

	constructor(store: Store) {
		this.content$ = store.select((state) => state.content);
	}

	ngOnInit() {
		this.content$.subscribe((content) => {
			this.content = content;
		});
	}
}
