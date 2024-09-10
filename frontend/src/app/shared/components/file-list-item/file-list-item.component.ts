import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FileMetadataResponse } from 'generated';
import { IDeletable } from 'src/app/shared/models/IDeletable';
import { IDownloadable } from 'src/app/shared/models/IDownloadable';
import { IRenamable } from 'src/app/shared/models/IRenamable';
import { ISelectable } from 'src/app/shared/models/ISelectable';

@Component({
	selector: 'file-list-item',
	standalone: true,
	templateUrl: './file-list-item.component.html',
	styleUrl: './file-list-item.component.css',
})
export class FileListItemComponent implements ISelectable, IDownloadable, IRenamable, IDeletable {
	@Input({ required: true })
	public metadata!: FileMetadataResponse;

	@HostBinding('class.selected')
	@Input('isSelected')
	public isSelected: boolean = false;

	@Output()
	public onDelete: EventEmitter<void> = new EventEmitter();

	select(): void {
		this.isSelected = true;
	}

	unselect(): void {
		this.isSelected = false;
	}

	public rename(event?: Event): void {
		event?.preventDefault();
	}

	public delete(event?: Event): void {
		event?.preventDefault();

		this.onDelete.emit();
	}

	public download(event?: Event): void {
		event?.preventDefault();
	}

	protected formatBytes(bytes: number, decimals: number = 2): string {
		if (!+bytes) return '0 B';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	protected formatDate(dateOrString: Date | string): string {
		const date = dateOrString instanceof Date ? dateOrString : new Date(Date.parse(dateOrString));

		const day = date.toLocaleDateString('de-DE', { day: 'numeric' });
		const month = date.toLocaleDateString('de-DE', { month: 'short' });
		const year = date.toLocaleDateString('de-DE', { year: '2-digit' });

		return `${day} ${month} ${year}`;
	}
}
