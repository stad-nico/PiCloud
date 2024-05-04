import { FileDownloadParams } from 'src/api/file/mapping/download';

describe('FileDownloadParams', () => {
	it('should create instance', () => {
		expect(new (FileDownloadParams as any)('path')).toBeInstanceOf(FileDownloadParams);
	});
});
