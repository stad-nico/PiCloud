import { FileRenameParams } from 'src/modules/files/mapping/rename';

describe('FileRenameParams', () => {
	it('should create instance', () => {
		expect(new (FileRenameParams as any)('path')).toBeInstanceOf(FileRenameParams);
	});
});
