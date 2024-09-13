import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Directory } from 'src/app/features/content-list/components/pure-content-list/pure-content-list.component';
import { CheckboxCheckEvent, CheckboxComponent, CheckboxUncheckEvent } from 'src/app/shared/components/checkbox/checkbox.component';
import { DirectoryListItemComponent } from 'src/app/shared/components/directory-list-item/directory-list-item.component';

export type ListItemSelectEvent = CheckboxCheckEvent & {
	id: string;
};

export type ListItemUnselectEvent = CheckboxUncheckEvent & {
	id: string;
};

export type ListItemOpenEvent = {
	id: string;
};

export type ListItemDeleteEvent = {
	id: string;
};

@Component({
	standalone: true,
	selector: 'selectable-directory-list-item',
	templateUrl: './selectable-directory-list-item.component.html',
	styleUrl: './selectable-directory-list-item.component.css',
	imports: [DirectoryListItemComponent, CheckboxComponent],
	animations: [
		trigger('isSelectable', [
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
export class SelectableDirectoryListItemComponent {
	@HostBinding('class.selected')
	@Input('isSelected')
	public isSelected: boolean = false;

	@HostBinding('class.selectable')
	@Input('isSelectable')
	public isSelectable: boolean = false;

	@Input()
	public isBeingProcessed: boolean = false;

	@Input({ required: true })
	public id!: string;

	@Input({ required: true })
	public metadata!: Directory;

	@Output()
	public onSelect: EventEmitter<ListItemSelectEvent> = new EventEmitter();

	@Output()
	public onUnselect: EventEmitter<ListItemUnselectEvent> = new EventEmitter();

	@Output()
	public onOpen: EventEmitter<ListItemOpenEvent> = new EventEmitter();

	@Output()
	public onDelete: EventEmitter<ListItemDeleteEvent> = new EventEmitter();

	public onCheck(event: CheckboxCheckEvent) {
		this.onSelect.emit({ id: this.id, ...event });
	}

	public onUncheck(event: CheckboxUncheckEvent) {
		this.onUnselect.emit({ id: this.id, ...event });
	}

	public onClick(event: MouseEvent) {
		if (event.detail > 1) {
			event.preventDefault();
		}
	}
}
