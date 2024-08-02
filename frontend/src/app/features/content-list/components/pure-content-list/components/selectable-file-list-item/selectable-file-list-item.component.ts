import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { DirectoryContentFile } from 'generated';
import {
	ListItemSelectEvent,
	ListItemUnselectEvent,
} from 'src/app/features/content-list/components/pure-content-list/components/selectable-directory-list-item/selectable-directory-list-item.component';
import { CheckboxCheckEvent, CheckboxComponent, CheckboxUncheckEvent } from 'src/app/shared/components/checkbox/checkbox.component';
import { FileListItemComponent } from 'src/app/shared/components/file-list-item/file-list-item.component';

@Component({
	standalone: true,
	selector: 'selectable-file-list-item',
	templateUrl: './selectable-file-list-item.component.html',
	styleUrl: './selectable-file-list-item.component.css',
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
export class SelectableFileListItemComponent {
	@HostBinding('class.selected')
	@Input('isSelected')
	public isSelected: boolean = false;

	@HostBinding('class.selectable')
	@Input('isSelectable')
	public isSelectable: boolean = false;

	@Input({ required: true })
	public id!: number;

	@Input({ required: true })
	public metadata!: DirectoryContentFile;

	@Output()
	public onSelect: EventEmitter<ListItemSelectEvent> = new EventEmitter();

	@Output()
	public onUnselect: EventEmitter<ListItemUnselectEvent> = new EventEmitter();

	public onCheck(event: CheckboxCheckEvent) {
		this.onSelect.emit({ id: this.id, ...event });
	}

	public onUncheck(event: CheckboxUncheckEvent) {
		this.onUnselect.emit({ id: this.id, ...event });
	}
}
