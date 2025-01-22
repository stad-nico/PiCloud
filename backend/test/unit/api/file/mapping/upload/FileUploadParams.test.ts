import { FileUploadParams } from 'src/modules/files/mapping/upload';

describe('FileUploadParams', () => {
	it('should create instance', () => {
		expect(new (FileUploadParams as any)('path')).toBeInstanceOf(FileUploadParams);
	});
});
