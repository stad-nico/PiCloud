import { FileMetadataDto } from 'src/api/files/dtos/file.metadata.dto';

describe('FileMetadataDto', () => {
	it('should construct a new FileUploadDto', () => {
		const fileMetadataDto = new FileMetadataDto('test');

		expect(fileMetadataDto).toStrictEqual(new FileMetadataDto('test'));
	});
});
