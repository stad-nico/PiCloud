import { ReadStream } from 'fs';

export class FileDownloadResponseDto {
	readonly name: string;

	readonly readableStream: ReadStream;

	readonly mimeType: string;

	private constructor(name: string, mimeType: string, readableStream: ReadStream) {
		this.name = name;
		this.mimeType = mimeType;
		this.readableStream = readableStream;
	}

	public static from(name: string, mimeType: string, readableStream: ReadStream): FileDownloadResponseDto {
		return new FileDownloadResponseDto(name, mimeType, readableStream);
	}
}
