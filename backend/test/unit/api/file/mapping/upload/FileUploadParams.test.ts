import { FileUploadParams } from 'src/api/file/mapping/upload';

describe('FileUploadParams', () => {
	it('should create instance', () => {
		expect(new (FileUploadParams as any)('path')).toBeInstanceOf(FileUploadParams);
	});
});
