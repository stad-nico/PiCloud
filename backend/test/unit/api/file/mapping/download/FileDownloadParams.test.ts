import { FileMetadataParams } from 'src/modules/files/mapping/metadata';

describe('FileMetadataParams', () => {
	it('should create instance', () => {
		expect(new (FileMetadataParams as any)('path')).toBeInstanceOf(FileMetadataParams);
	});
});
