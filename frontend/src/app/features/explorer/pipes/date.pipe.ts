import { DatePipe as CommonDatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'date' })
export class DatePipe implements PipeTransform {
	public transform(value: string): string | null {
		const date = new Date(Date.parse(value));

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

		return new CommonDatePipe('de-DE').transform(value, 'dd LLL YYYY');
	}
}
