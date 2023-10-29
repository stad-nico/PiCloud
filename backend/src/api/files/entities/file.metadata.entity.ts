import { FileUploadDto } from 'src/api/files/dtos/file.upload.dto';

export class FileMetadataEntity {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(fileUploadDto: FileUploadDto): FileMetadataEntity {
		return new FileMetadataEntity(fileUploadDto.path);
	}
}
