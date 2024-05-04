import { DirectoryDownloadParams } from 'src/api/directory/mapping/download';

describe('DirectoryDownloadParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryDownloadParams as any)('path')).toBeInstanceOf(DirectoryDownloadParams);
	});
});
