import { DirectoryDownloadParams } from 'src/modules/directories/mapping/download';

describe('DirectoryDownloadParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryDownloadParams as any)('path')).toBeInstanceOf(DirectoryDownloadParams);
	});
});
