import { Component, EventEmitter, Output } from '@angular/core';
import { CreateDirectoryButtonComponent } from 'src/components/app/explorer/menu/create-directory-button/CreateDirectoryButtonComponent';

@Component({
	selector: 'menu',
	standalone: true,
	templateUrl: './MenuComponent.html',
	styleUrl: './MenuComponent.css',
	imports: [CreateDirectoryButtonComponent],
})
export class MenuComponent {
	@Output()
	createDirectoryEmitter = new EventEmitter<void>();

	createDirectory() {
		this.createDirectoryEmitter.emit();
	}
}
