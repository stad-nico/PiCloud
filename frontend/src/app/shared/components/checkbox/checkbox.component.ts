import { Component, ElementRef, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';

export type CheckboxCheckEvent = {
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	nativeEvent: MouseEvent | PointerEvent;
};

export type CheckboxUncheckEvent = {
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	nativeEvent: MouseEvent | PointerEvent;
};

@Component({
	selector: 'checkbox',
	standalone: true,
	templateUrl: './checkbox.component.html',
	styleUrl: './checkbox.component.css',
})
export class CheckboxComponent {
	@ViewChild('input')
	public input!: ElementRef<HTMLInputElement>;

	@Output()
	public onCheck: EventEmitter<CheckboxCheckEvent> = new EventEmitter();

	@Output()
	public onUncheck: EventEmitter<CheckboxUncheckEvent> = new EventEmitter();

	@HostBinding('class.selected')
	@Input('isSelected')
	public isSelected: boolean = false;

	public onClick(event: PointerEvent | MouseEvent) {
		event.preventDefault();

		// this.isSelected = !this.isSelected;

		const payload: CheckboxCheckEvent | CheckboxUncheckEvent = { nativeEvent: event, ctrl: event.ctrlKey, shift: event.shiftKey, alt: event.altKey };

		if (!this.isSelected) {
			this.onCheck.emit(payload);
		} else {
			this.onUncheck.emit(payload);
		}
	}
}
