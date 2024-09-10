import { Component, ElementRef, EventEmitter, HostBinding, Output, ViewChild } from '@angular/core';

@Component({
	standalone: true,
	selector: 'nameable-directory-item',
	templateUrl: './nameable-directory-item.component.html',
	styleUrl: './nameable-directory-item.component.css',
})
export class NameableDirectoryItemComponent {
	private readonly regExp =
		/^([-_.]?[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df])([-_. ]?[a-zA-Z-0-9\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df])*$/m;

	private readonly ref: ElementRef;

	private isDeleteBeingHeld: boolean = false;

	@ViewChild('input')
	public input!: ElementRef<HTMLInputElement>;

	@HostBinding('class.is-invalid')
	public isNameInvalid: boolean = false;

	@Output()
	public onSuccess: EventEmitter<string> = new EventEmitter();

	@Output()
	public onDestroy: EventEmitter<string> = new EventEmitter();

	public constructor(ref: ElementRef) {
		this.ref = ref;
	}

	ngAfterViewInit() {
		this.focus();

		this.input.nativeElement.addEventListener('input', () => (this.isNameInvalid = !this.isNameValid()));

		this.input.nativeElement.addEventListener('change', () => this.onSubmit());

		this.input.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Escape' || (event.key === 'Backspace' && this.input.nativeElement.value === '' && !this.isDeleteBeingHeld)) {
				this.onDestroy.emit();
			}

			if (event.key === 'Backspace') {
				this.isDeleteBeingHeld = true;
			}
		});

		this.input.nativeElement.addEventListener('keyup', (event: KeyboardEvent) => {
			if (event.key === 'Backspace') {
				this.isDeleteBeingHeld = false;
			}
		});
	}

	private onSubmit() {
		if (!this.isNameValid()) {
			return;
		}

		this.onSuccess.emit(this.input.nativeElement.value);
	}

	private isNameValid() {
		return this.regExp.test(this.input.nativeElement.value);
	}

	private focus() {
		this.input.nativeElement.focus();
	}
}
