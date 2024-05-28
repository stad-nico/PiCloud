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

	formatBytes(bytes: number, decimals: number = 2): string {
		if (!+bytes) return '0 B';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}
}
