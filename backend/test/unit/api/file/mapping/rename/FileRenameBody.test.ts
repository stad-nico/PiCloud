import { FileRenameBody } from 'src/api/file/mapping/rename';

describe('FileRenameBody', () => {
	it('should create instance', () => {
		expect(new (FileRenameBody as any)('path')).toBeInstanceOf(FileRenameBody);
	});
});
