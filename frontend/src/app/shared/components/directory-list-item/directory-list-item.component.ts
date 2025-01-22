import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
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
	public metadata!: { name: string; size: number; updatedAt: string };

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

	protected formatBytes(bytes: number, decimals: number = 0): string {
		if (!+bytes) return '';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

		return `${size} ${sizes[i]}`;
	}

	protected formatDate(dateOrString: Date | string): string {
		const date = dateOrString instanceof Date ? dateOrString : new Date(Date.parse(dateOrString));

		const dateWithoutTime = new Date(date).setHours(0, 0, 0, 0);
		const todaysDateWithoutTime = new Date().setHours(0, 0, 0, 0);

		if (dateWithoutTime === todaysDateWithoutTime) {
			return 'Heute';
		}

		const yesterdaysDate = new Date().setDate(new Date().getDate() - 1);
		const yesterdaysDateWithoutTime = new Date(yesterdaysDate).setHours(0, 0, 0, 0);

		if (dateWithoutTime === yesterdaysDateWithoutTime) {
			return 'Gestern';
		}

		const day = date.toLocaleDateString('de-DE', { day: '2-digit' });
		const month = date.toLocaleDateString('de-DE', { month: 'short' });
		const year = date.toLocaleDateString('de-DE', { year: '2-digit' });

		return `${day}. ${month} ${year}`;
	}
}
