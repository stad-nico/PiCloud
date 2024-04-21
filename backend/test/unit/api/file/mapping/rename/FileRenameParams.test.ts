import { FileRenameParams } from 'src/api/file/mapping/rename';

describe('FileRenameParams', () => {
	it('should create instance', () => {
		expect(new (FileRenameParams as any)('path')).toBeInstanceOf(FileRenameParams);
	});
});
