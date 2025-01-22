import { DirectoryRenameParams } from 'src/modules/directories/mapping/rename';

describe('DirectoryRenameParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryRenameParams as any)('path')).toBeInstanceOf(DirectoryRenameParams);
	});
});
