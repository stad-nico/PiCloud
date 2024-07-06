import { Component, ContentChild, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { SelectableComponent } from 'src/app/features/content-list/components/pure-content-list/components/selectable-list-item/selectable.component';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { ISelectable } from 'src/app/shared/models/ISelectable';
import { SelectEvent } from 'src/app/shared/models/SelectedEvent';

@Component({
	selector: 'selectable-list-item',
	standalone: true,
	templateUrl: './selectable-list-item.component.html',
	styleUrl: './selectable-list-item.component.css',
	imports: [CheckboxComponent],
})
export class SelectableListItemComponent implements ISelectable {
	@HostBinding('class.selected')
	public selected: boolean = false;

	@ContentChild(SelectableComponent)
	public content!: ISelectable;

	@HostBinding('class.selectable')
	@Input('selectable')
	public isSelectable: boolean = true;

	@Output()
	public onClick: EventEmitter<SelectEvent> = new EventEmitter();

	public onClickHandler(event: SelectEvent) {
		this.onClick.emit({ component: this, ...event });
	}

	public select(): void {
		this.selected = true;

		this.content.select();
	}

	public unselect(): void {
		this.selected = false;

		this.content.unselect();
	}
}
