import { Component, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
	standalone: true,
	selector: 'create-directory-button',
	styleUrl: './CreateDirectoryButtonComponent.css',
	templateUrl: './CreateDirectoryButtonComponent.html',
})
export class CreateDirectoryButtonComponent {
	@Output()
	createDirectoryEmitter = new EventEmitter<void>();

	@HostListener('click')
	onClick() {
		this.createDirectoryEmitter.emit();
	}
}
