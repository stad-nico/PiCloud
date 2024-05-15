import { Component, Input } from '@angular/core';

@Component({
	selector: 'content-list-file',
	standalone: true,
	templateUrl: './ContentListFileComponent.html',
})
export class ContentListFileComponent {
	@Input({ required: true })
	name!: string;

	@Input({ required: true })
	size!: number;
}
