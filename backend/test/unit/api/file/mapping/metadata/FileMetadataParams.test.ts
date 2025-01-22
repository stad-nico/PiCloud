import { FileDownloadParams } from 'src/modules/files/mapping/download';

describe('FileDownloadParams', () => {
	it('should create instance', () => {
		expect(new (FileDownloadParams as any)('path')).toBeInstanceOf(FileDownloadParams);
	});
});
