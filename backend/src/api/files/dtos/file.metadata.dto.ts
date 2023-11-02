import { FileMetadataParams } from 'src/api/files/params/file.metadata.params';

export class FileMetadataDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(fileMetadataParams: FileMetadataParams): FileMetadataDto {
		return new FileMetadataDto(fileMetadataParams.path);
	}
}
