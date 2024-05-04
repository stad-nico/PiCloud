import { FileMetadataParams } from 'src/api/file/mapping/metadata';

describe('FileMetadataParams', () => {
	it('should create instance', () => {
		expect(new (FileMetadataParams as any)('path')).toBeInstanceOf(FileMetadataParams);
	});
});
