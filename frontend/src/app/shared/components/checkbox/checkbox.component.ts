import { Component, EventEmitter, Output } from '@angular/core';
import { SelectEvent } from 'src/app/shared/models/SelectedEvent';

@Component({
	selector: 'checkbox',
	standalone: true,
	templateUrl: './checkbox.component.html',
	styleUrl: './checkbox.component.css',
})
export class CheckboxComponent {
	@Output()
	public onClick: EventEmitter<SelectEvent> = new EventEmitter();

	public onClickHandler(event: PointerEvent | MouseEvent) {
		const checked = (event.target as HTMLInputElement).checked;

		this.onClick.emit({ selected: checked, ctrl: event.ctrlKey, shift: event.shiftKey });
	}
	// private selected: boolean = false;
	// @Output()
	// public selectEmitter: EventEmitter<void> = new EventEmitter();
	// @Output()
	// public unselectEmitter: EventEmitter<void> = new EventEmitter();
	// @HostListener('click')
	// public onClick() {
	// 	this.selected = !this.selected;
	// 	if (this.selected) {
	// 		this.selectEmitter.emit();
	// 	} else {
	// 		this.unselectEmitter.emit();
	// 	}
	// }
}
