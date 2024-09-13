import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FileMetadataResponse } from 'generated';
import { IDeletable } from 'src/app/shared/models/IDeletable';
import { IDownloadable } from 'src/app/shared/models/IDownloadable';
import { IRenamable } from 'src/app/shared/models/IRenamable';
import { ISelectable } from 'src/app/shared/models/ISelectable';

const mimeTypeMap: { [mimeType: string]: string; default: 'Datei' } = {
	default: 'Datei',
	'application/pdf': 'PDF-Dokument',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word-Dokument',
	'text/plain': 'Textdatei',
	'image/jpeg': 'Bilddatei',
	'image/png': 'Bilddatei',
	'image/svg+xml': 'Vektorgraphik',
};

const mimeTypeIconMap: { [mimeType: string]: string; default: 'assets/icons/default.svg' } = {
	default: 'assets/icons/default.svg',
	'application/pdf': 'assets/icons/pdf.svg',
	'image/png': 'assets/icons/image.svg',
	'image/svg+xml': 'assets/icons/svg.svg',
	'image/jpeg': 'assets/icons/image.svg',
	'text/plain': 'assets/icons/txt.svg',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'assets/icons/word.svg',
};

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

	//! TEMP
	hasAlerted: boolean = false;

	select(): void {
		this.isSelected = true;
	}

	unselect(): void {
		this.isSelected = false;
	}

	getIconSource() {
		if (this.metadata.mimeType in mimeTypeIconMap) {
			return mimeTypeIconMap[this.metadata.mimeType];
		}

		return mimeTypeIconMap['default'];
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

	protected formatBytes(bytes: number, decimals: number = 0): string {
		if (!+bytes) return '0 B';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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

		const day = date.toLocaleDateString('de-DE', { day: 'numeric' });
		const month = date.toLocaleDateString('de-DE', { month: 'short' });
		const year = date.toLocaleDateString('de-DE', { year: '2-digit' });

		return `${day} ${month} ${year}`;
	}

	protected formatType(mimeType: string) {
		if (mimeType in mimeTypeMap) {
			return mimeTypeMap[mimeType];
		}

		//! TEMP
		if (!this.hasAlerted) {
			alert(`Unknown mime type: ${mimeType} (${this.metadata.name})`);
			this.hasAlerted = true;
		}

		return mimeTypeMap['default'];
	}
}
