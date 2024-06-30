import { Component, Input } from '@angular/core';

@Component({
	selector: 'directory-list-item',
	standalone: true,
	templateUrl: './directory-list-item.component.html',
	styleUrl: './directory-list-item.component.css',
})
export class DirectoryListItemComponent {
	@Input({ required: true })
	public name!: string;

	@Input({ required: true })
	public size!: number;

	protected formatBytes(bytes: number, decimals: number = 2): string {
		if (!+bytes) return '0 B';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}
}
