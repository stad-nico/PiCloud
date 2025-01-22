import { DirectoryMetadataParams } from 'src/modules/directories/mapping/metadata';

describe('DirectoryMetadataParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryMetadataParams as any)('path')).toBeInstanceOf(DirectoryMetadataParams);
	});
});
