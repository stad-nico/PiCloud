import { DirectoryRenameBody } from 'src/api/directory/mapping/rename';

describe('DirectoryRenameBody', () => {
	it('should create instance', () => {
		expect(new (DirectoryRenameBody as any)('path')).toBeInstanceOf(DirectoryRenameBody);
	});
});
