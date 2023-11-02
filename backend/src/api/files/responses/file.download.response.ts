import { ReadStream } from 'fs';

export class FileDownloadResponse {
	readonly name: string;

	readonly readableStream: ReadStream;

	readonly mimeType: string;

	private constructor(name: string, mimeType: string, readableStream: ReadStream) {
		this.name = name;
		this.mimeType = mimeType;
		this.readableStream = readableStream;
	}

	public static from(name: string, mimeType: string, readableStream: ReadStream): FileDownloadResponse {
		return new FileDownloadResponse(name, mimeType, readableStream);
	}
}
