import { FileRenameBody } from 'src/modules/files/mapping/rename';

describe('FileRenameBody', () => {
	it('should create instance', () => {
		expect(new (FileRenameBody as any)('path')).toBeInstanceOf(FileRenameBody);
	});
});
