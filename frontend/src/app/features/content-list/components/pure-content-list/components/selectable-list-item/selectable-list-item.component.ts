import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Directory, File } from 'src/app/core/components/explorer/state/explorer.state';
import {
	ListItemDeleteEvent,
	ListItemDownloadEvent,
	ListItemOpenEvent,
	ListItemSelectEvent,
	ListItemUnselectEvent,
} from 'src/app/features/content-list/content-list.component';
import { CheckboxCheckEvent, CheckboxComponent, CheckboxUncheckEvent } from 'src/app/shared/components/checkbox/checkbox.component';
import { FileListItemComponent } from 'src/app/shared/components/file-list-item/file-list-item.component';

@Component({
	standalone: true,
	selector: 'selectable-list-item',
	templateUrl: './selectable-list-item.component.html',
	styleUrl: './selectable-list-item.component.css',
	imports: [FileListItemComponent, CheckboxComponent],
	animations: [
		trigger('isSelectable', [
			state('true', style({})),
			state('false', style({})),
			transition('false => true', [
				query('checkbox', [
					style({
						marginLeft: '-2rem',
						opacity: 0,
					}),
					group([animate('0.25s ease-out', style({ opacity: 1 })), animate('0.3s ease', style({ marginLeft: 0 }))]),
				]),
			]),
			transition('true => false', [
				query('checkbox', [
					style({
						marginLeft: 0,
						opacity: 1,
					}),
					group([animate('0.25s 0.05s ease', style({ opacity: 0 })), animate('0.3s ease', style({ marginLeft: '-2rem' }))]),
				]),
			]),
		]),
	],
})
export class SelectableListItemComponent {
	@HostBinding('class.selected')
	@Input('isSelected')
	public isSelected: boolean = false;

	@HostBinding('class.selectable')
	@Input('isSelectable')
	public isSelectable: boolean = false;

	@Input({ required: true })
	public data!: File | Directory;

	@Input()
	public isBeingProcessed: boolean = false;

	@Output()
	public onSelect: EventEmitter<ListItemSelectEvent> = new EventEmitter();

	@Output()
	public onUnselect: EventEmitter<ListItemUnselectEvent> = new EventEmitter();

	@Output()
	public onDelete: EventEmitter<ListItemDeleteEvent> = new EventEmitter();

	@Output()
	public onDownload: EventEmitter<ListItemDownloadEvent> = new EventEmitter();

	@Output()
	public onOpen: EventEmitter<ListItemOpenEvent> = new EventEmitter();

	public onCheck(event: CheckboxCheckEvent) {
		this.onSelect.emit({ id: this.data.id, ...event });
	}

	public onUncheck(event: CheckboxUncheckEvent) {
		this.onUnselect.emit({ id: this.data.id, ...event });
	}

	public download() {
		this.onDownload.emit({ id: this.data.id, name: this.data.name, type: this.data.type });
	}

	public onClick(event: MouseEvent) {
		if (event.detail > 1) {
			event.preventDefault();
		}
	}
}
