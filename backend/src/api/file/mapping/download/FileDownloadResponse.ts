import { Readable } from 'stream';

export class FileDownloadResponse {
	readonly name: string;

	readonly mimeType: string;

	readonly readable: Readable;

	private constructor(name: string, mimeType: string, readable: Readable) {
		this.name = name;
		this.mimeType = mimeType;
		this.readable = readable;
	}

	public static from(name: string, mimeType: string, readable: Readable): FileDownloadResponse {
		return new FileDownloadResponse(name, mimeType, readable);
	}
}
