import { DirectoryContentParams } from 'src/modules/directories/mapping/content';

describe('DirectoryContentParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryContentParams as any)('path')).toBeInstanceOf(DirectoryContentParams);
	});
});
