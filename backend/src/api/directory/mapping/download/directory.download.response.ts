import { ReadStream } from 'fs';

export class DirectoryDownloadResponse {
	readonly name: string;

	readonly mimeType: string;

	readonly readStream: ReadStream;

	private constructor(name: string, mimeType: string, readStream: ReadStream) {
		this.name = name;
		this.mimeType = mimeType;
		this.readStream = readStream;
	}
}
