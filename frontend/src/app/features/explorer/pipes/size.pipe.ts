import { Pipe, PipeTransform } from '@angular/core';

const SUFFIXES = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

@Pipe({ name: 'size' })
export class SizePipe implements PipeTransform {
	public transform(value: number, decimals = 0): string {
		if (!+value) return 'Leer';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;

		const i = Math.floor(Math.log(value) / Math.log(k));

		const size = parseFloat((value / Math.pow(k, i)).toFixed(dm));

		return `${size} ${SUFFIXES[i]}`;
	}
}
