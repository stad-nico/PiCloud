import { Component, Input } from '@angular/core';

export enum FileExtension {
	DEFAULT = 'default',
	TXT = 'txt',
}

@Component({
	selector: 'content-list-file',
	standalone: true,
	templateUrl: './ContentListFileComponent.html',
	styleUrl: './ContentListFileComponent.css',
})
export class ContentListFileComponent {
	@Input({ required: true })
	name!: string;

	@Input({ required: true })
	size!: number;

	extension!: FileExtension;

	ngOnInit() {
		this.extension = /*(<any>FileExtension)[this.name.match(/(?!\.)([^\.]+)$/gim)![0].toUpperCase() as FileExtension] ?? */ FileExtension.DEFAULT;
	}
}
