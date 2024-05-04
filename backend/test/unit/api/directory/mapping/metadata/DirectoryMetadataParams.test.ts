import { DirectoryMetadataParams } from 'src/api/directory/mapping/metadata';

describe('DirectoryMetadataParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryMetadataParams as any)('path')).toBeInstanceOf(DirectoryMetadataParams);
	});
});
