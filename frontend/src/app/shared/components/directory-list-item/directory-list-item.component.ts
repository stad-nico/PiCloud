import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { DirectoryMetadataResponse } from 'generated';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
	selector: 'directory-list-item',
	standalone: true,
	templateUrl: './directory-list-item.component.html',
	styleUrl: './directory-list-item.component.css',
	imports: [LoadingSpinnerComponent],
})
export class DirectoryListItemComponent {
	@Input({ required: true })
	public metadata!: DirectoryMetadataResponse;

	@HostBinding('class.selected')
	@Input('isSelected')
	public isSelected: boolean = false;

	@HostBinding('class.is-being-processed')
	@Input()
	public isBeingProcessed: boolean = false;

	@Output()
	public onRename: EventEmitter<void> = new EventEmitter();

	@Output()
	public onDelete: EventEmitter<void> = new EventEmitter();

	@Output()
	public onDownload: EventEmitter<void> = new EventEmitter();

	@Output()
	public onDblClick: EventEmitter<void> = new EventEmitter();

	@HostListener('dblclick')
	public dblClick() {
		this.onDblClick.emit();
	}

	public rename(event: Event): void {
		event.preventDefault();

		this.onRename.emit();
	}

	public delete(event: Event): void {
		event.preventDefault();

		this.onDelete.emit();
	}

	public download(event: Event): void {
		event.preventDefault();

		this.onDownload.emit();
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
