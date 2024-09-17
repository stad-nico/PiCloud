import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { Directory, File, Type } from 'src/app/core/components/explorer/state/explorer.state';
import { LoadingSpinnerComponent } from 'src/app/shared/components/loading-spinner/loading-spinner.component';

const mimeTypeMap: { [mimeType: string]: string } = {
	default: 'Datei',
	directory: 'Ordner',
	'application/pdf': 'PDF-Dokument',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word-Dokument',
	'text/plain': 'Textdatei',
	'image/jpeg': 'Bilddatei',
	'image/png': 'Bilddatei',
	'image/svg+xml': 'Vektorgraphik',
	'text/css': 'Stylesheet',
};

const mimeTypeIconMap: { [mimeType: string]: string } = {
	default: 'assets/icons/default.svg',
	directory: 'assets/icons/directory.svg',
	'application/pdf': 'assets/icons/pdf.svg',
	'image/png': 'assets/icons/image.svg',
	'image/svg+xml': 'assets/icons/svg.svg',
	'image/jpeg': 'assets/icons/image.svg',
	'text/plain': 'assets/icons/txt.svg',
	'text/css': 'assets/icons/css.svg',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'assets/icons/word.svg',
};

@Component({
	selector: 'file-list-item',
	standalone: true,
	templateUrl: './file-list-item.component.html',
	styleUrl: './file-list-item.component.css',
	imports: [LoadingSpinnerComponent],
})
export class FileListItemComponent {
	@Input({ required: true })
	public data!: File | Directory;

	@HostBinding('class.selected')
	@Input('isSelected')
	public isSelected: boolean = false;

	@HostBinding('class.is-being-processed')
	@Input()
	public isBeingProcessed: boolean = false;

	@Output()
	public onDelete: EventEmitter<void> = new EventEmitter();

	@Output()
	public onDownload: EventEmitter<string> = new EventEmitter();

	@Output()
	public onRename: EventEmitter<string> = new EventEmitter();

	@Output()
	public onDblClick: EventEmitter<void> = new EventEmitter();

	public getIconSource = FileListItemComponent.getIconSource;

	//! TEMP
	hasAlerted: boolean = false;

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

	public formatSize(): string {
		if (!+this.data.size) return '';

		const k = 1024;
		const decimals = 0;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(this.data.size) / Math.log(k));

		return `${parseFloat((this.data.size / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
	}

	public formatDate(dateOrString: Date | string): string {
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

		const day = date.toLocaleDateString('de-DE', { day: 'numeric' });
		const month = date.toLocaleDateString('de-DE', { month: 'short' });
		const year = date.toLocaleDateString('de-DE', { year: '2-digit' });

		return `${day} ${month} ${year}`;
	}

	public formatType() {
		if (this.data.type === Type.File) {
			return mimeTypeMap[this.data.mimeType] ?? mimeTypeMap['default'];
		}

		return mimeTypeMap['directory'];
	}

	public static getIconSource(data: File | Directory) {
		if (data.type === Type.Directory) {
			return mimeTypeIconMap['directory'];
		}

		if (data.mimeType in mimeTypeIconMap) {
			return mimeTypeIconMap[data.mimeType];
		}

		return mimeTypeIconMap['default'];
	}

	public isFile() {
		return this.data.type === Type.File;
	}
}
