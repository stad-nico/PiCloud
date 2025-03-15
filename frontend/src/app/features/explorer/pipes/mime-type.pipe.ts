import { Pipe, PipeTransform } from '@angular/core';

/**
 * Map of mime types to their names that are shown in the data grid under the column "Typ".
 */
const MIME_TYPE_NAME_MAP: Record<string, string> = {
	'application/pdf': 'PDF-Dokument',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word-Dokument',
	'text/plain': 'Textdatei',
	'image/jpeg': 'Bilddatei',
	'image/png': 'Bilddatei',
	'image/svg+xml': 'Vektorgraphik',
	'text/css': 'Stylesheet',
	'application/octet-stream': 'Datei',
};

@Pipe({ name: 'mimeType' })
export class MimeTypePipe implements PipeTransform {
	/**
	 * Transform a mime type to a readable name.
	 *
	 * @param value the mime type
	 * @returns the readable name
	 */
	public transform(value: string): string {
		return MIME_TYPE_NAME_MAP[value] || 'Datei';
	}
}
