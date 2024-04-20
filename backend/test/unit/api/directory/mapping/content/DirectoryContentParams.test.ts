import { DirectoryContentParams } from 'src/api/directory/mapping/content';

describe('DirectoryContentParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryContentParams as any)('path')).toBeInstanceOf(DirectoryContentParams);
	});
});
