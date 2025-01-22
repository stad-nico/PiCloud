import { DirectoryRenameBody } from 'src/modules/directories/mapping/rename';

describe('DirectoryRenameBody', () => {
	it('should create instance', () => {
		expect(new (DirectoryRenameBody as any)('path')).toBeInstanceOf(DirectoryRenameBody);
	});
});
