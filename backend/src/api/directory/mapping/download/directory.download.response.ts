import { Readable } from 'stream';

export class DirectoryDownloadResponse {
	readonly name: string;

	readonly mimeType: string;

	readonly readable: Readable;

	private constructor(name: string, mimeType: string, readable: Readable) {
		this.name = name;
		this.mimeType = mimeType;
		this.readable = readable;
	}

	public static from(name: string, mimeType: string, readable: Readable): DirectoryDownloadResponse {
		return new DirectoryDownloadResponse(name, mimeType, readable);
	}
}
