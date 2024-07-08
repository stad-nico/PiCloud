import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ISelectable } from 'src/app/shared/models/ISelectable';
import { SelectEvent } from 'src/app/shared/models/SelectedEvent';

@Component({
	selector: 'checkbox',
	standalone: true,
	templateUrl: './checkbox.component.html',
	styleUrl: './checkbox.component.css',
})
export class CheckboxComponent implements ISelectable {
	@ViewChild('input')
	public input!: ElementRef<HTMLInputElement>;

	@Output()
	public onClick: EventEmitter<SelectEvent> = new EventEmitter();

	public onClickHandler(event: PointerEvent | MouseEvent) {
		const checked = (event.target as HTMLInputElement).checked;

		this.onClick.emit({ selected: checked, ctrl: event.ctrlKey, shift: event.shiftKey });
	}

	public select(): void {
		this.input.nativeElement.checked = true;
	}

	public unselect(): void {
		this.input.nativeElement.checked = false;
	}
}
