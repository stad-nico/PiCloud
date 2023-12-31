import { DirectoryMetadataParams } from './directory.metadata.params';

export class DirectoryMetadataDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryMetadataParams: DirectoryMetadataParams): DirectoryMetadataDto {
		return new DirectoryMetadataDto(directoryMetadataParams.path);
	}
}
