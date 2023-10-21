import { FileUploadDto } from 'src/api/files/dtos/file.upload.dto';

describe('FileUploadDto', () => {
	it('should construct a new FileUploadDto', () => {
		const fileUploadDto = new FileUploadDto('test');

		expect(fileUploadDto).toStrictEqual(new FileUploadDto('test'));
	});
});
