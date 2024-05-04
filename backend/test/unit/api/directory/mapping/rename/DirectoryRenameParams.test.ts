import { DirectoryRenameParams } from 'src/api/directory/mapping/rename';

describe('DirectoryRenameParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryRenameParams as any)('path')).toBeInstanceOf(DirectoryRenameParams);
	});
});
